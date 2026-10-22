package org.cardanofoundation.reeve.indexer.service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.CurrencyTotals;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.FundingOverview;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.LabelCount;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.MonthAmounts;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.MonthCount;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.RecentEvent;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.RecentReport;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.RecentTransaction;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.ReportOverview;
import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView.TransactionOverview;

/**
 * Aggregates the landing-page dashboard straight from the indexer tables. Plain SQL rather than JPQL:
 * every query is a GROUP BY / COUNT roll-up and loading entities just to count them would be wasteful.
 * A {@code null} organisation id aggregates across every organisation.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int RECENT_LIMIT = 6;

    // Postgres can't infer the type of a bare null bind parameter in "? IS NULL", hence the cast.
    private static final String ORG_FILTER = "(CAST(:org AS VARCHAR) IS NULL OR %s.organisation_id = :org)";

    private static final String EVENT_CURRENCY = "COALESCE(e.currency_cust_code, e.currency_id, '')";

    private final NamedParameterJdbcTemplate jdbc;

    public DashboardOverviewView overview(String organisationId) {
        MapSqlParameterSource params = new MapSqlParameterSource("org", organisationId);

        Long organisationCount = organisationId != null ? 1L
                : jdbc.queryForObject("SELECT COUNT(*) FROM reeve_organisation", params, Long.class);

        return DashboardOverviewView.builder()
                .organisationId(organisationId)
                .organisationCount(nz(organisationCount))
                .transactions(transactions(params))
                .reports(reports(params))
                .funding(funding(params))
                .build();
    }

    private TransactionOverview transactions(MapSqlParameterSource params) {
        String where = " WHERE " + ORG_FILTER.formatted("t") + " ";

        TransactionOverview overview = jdbc.queryForObject("""
                SELECT COUNT(*) AS total, COUNT(DISTINCT t.batch_id) AS batches,
                       MIN(t.date) AS first_date, MAX(t.date) AS last_date
                FROM reeve_transactions t""" + where, params, (rs, i) -> TransactionOverview.builder()
                .total(rs.getLong("total"))
                .batchCount(rs.getLong("batches"))
                .firstDate(toLocalDate(rs.getDate("first_date")))
                .lastDate(toLocalDate(rs.getDate("last_date")))
                .build());

        jdbc.query("""
                SELECT COUNT(*) AS items,
                       COUNT(DISTINCT ti.project_cust_code) AS projects,
                       COUNT(DISTINCT ti.counterparty_cust_code) AS counterparties
                FROM reeve_transaction_item ti
                JOIN reeve_transactions t ON t.id = ti.transaction_id""" + where, params, rs -> {
            overview.setItemCount(rs.getLong("items"));
            overview.setProjectCount(rs.getLong("projects"));
            overview.setCounterpartyCount(rs.getLong("counterparties"));
        });

        overview.setByType(jdbc.query("""
                SELECT t.type AS label, COUNT(*) AS count FROM reeve_transactions t""" + where + """
                 GROUP BY t.type ORDER BY count DESC""", params, LABEL_COUNT));

        overview.setMonthly(jdbc.query("""
                SELECT TO_CHAR(t.date, 'YYYY-MM') AS month, COUNT(*) AS count
                FROM reeve_transactions t""" + where + """
                 GROUP BY month ORDER BY month""", params, MONTH_COUNT));

        overview.setRecent(jdbc.query("""
                SELECT t.id, t.tx_hash, t.internal_number, t.type, t.date, t.organisation_id, o.name,
                       (SELECT COUNT(*) FROM reeve_transaction_item ti WHERE ti.transaction_id = t.id) AS items
                FROM reeve_transactions t
                LEFT JOIN reeve_organisation o ON o.id = t.organisation_id""" + where + """
                 ORDER BY t.date DESC, t.internal_number DESC LIMIT %d""".formatted(RECENT_LIMIT),
                params, (rs, i) -> RecentTransaction.builder()
                        .id(rs.getString("id"))
                        .txHash(rs.getString("tx_hash"))
                        .internalNumber(rs.getString("internal_number"))
                        .type(rs.getString("type"))
                        .date(toLocalDate(rs.getDate("date")))
                        .organisationId(rs.getString("organisation_id"))
                        .organisationName(rs.getString("name"))
                        .itemCount(rs.getLong("items"))
                        .build()));

        return overview;
    }

    private ReportOverview reports(MapSqlParameterSource params) {
        String where = " WHERE " + ORG_FILTER.formatted("r") + " ";

        ReportOverview overview = jdbc.queryForObject("""
                SELECT COUNT(*) AS publications,
                       COUNT(DISTINCT (r.organisation_id, r.sub_type, r."interval", r.year, r.period)) AS total,
                       COUNT(*) FILTER (WHERE r.identity_verified) AS verified
                FROM reeve_reports r""" + where, params, (rs, i) -> ReportOverview.builder()
                .publications(rs.getLong("publications"))
                .total(rs.getLong("total"))
                .verified(rs.getLong("verified"))
                .build());

        overview.setBySubType(jdbc.query("""
                SELECT COALESCE(r.sub_type, 'UNKNOWN') AS label, COUNT(*) AS count
                FROM reeve_reports r""" + where + """
                 GROUP BY label ORDER BY count DESC""", params, LABEL_COUNT));

        overview.setByInterval(jdbc.query("""
                SELECT COALESCE(r."interval", 'UNKNOWN') AS label, COUNT(*) AS count
                FROM reeve_reports r""" + where + """
                 GROUP BY label ORDER BY count DESC""", params, LABEL_COUNT));

        overview.setByYear(jdbc.query("""
                SELECT CAST(r.year AS VARCHAR) AS label, COUNT(*) AS count
                FROM reeve_reports r""" + where + """
                 AND r.year IS NOT NULL GROUP BY r.year ORDER BY r.year""", params, LABEL_COUNT));

        overview.setRecent(jdbc.query("""
                SELECT r.id, r.tx_hash, r.sub_type, r."interval", r.year, r.period, r.ver,
                       r.identity_verified, r.organisation_id, o.name
                FROM reeve_reports r
                LEFT JOIN reeve_organisation o ON o.id = r.organisation_id""" + where + """
                 ORDER BY r.year DESC NULLS LAST, r.period DESC NULLS LAST, r.id DESC LIMIT %d"""
                .formatted(RECENT_LIMIT), params, (rs, i) -> RecentReport.builder()
                .id(rs.getLong("id"))
                .txHash(rs.getString("tx_hash"))
                .subType(rs.getString("sub_type"))
                .interval(rs.getString("interval"))
                .year(rs.getObject("year", Integer.class))
                .period(rs.getObject("period", Integer.class))
                .ver(rs.getObject("ver", Long.class))
                .identityVerified(rs.getBoolean("identity_verified"))
                .organisationId(rs.getString("organisation_id"))
                .organisationName(rs.getString("name"))
                .build()));

        return overview;
    }

    private FundingOverview funding(MapSqlParameterSource params) {
        String where = " WHERE " + ORG_FILTER.formatted("e") + " ";

        FundingOverview overview = jdbc.queryForObject("""
                SELECT COUNT(*) AS events, COUNT(DISTINCT e.funding_id) AS rounds
                FROM reeve_event e""" + where, params, (rs, i) -> FundingOverview.builder()
                .eventCount(rs.getLong("events"))
                .fundingRoundCount(rs.getLong("rounds"))
                .build());

        Long projects = jdbc.queryForObject("""
                SELECT COUNT(DISTINCT a.project_id) FROM reeve_event_allocation a
                JOIN reeve_event e ON e.id = a.event_ref_id""" + where, params, Long.class);
        overview.setProjectCount(nz(projects));

        List<CurrencyTotals> totals = jdbc.query("""
                SELECT %s AS currency,
                       COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'FUNDING'), 0) AS funded,
                       COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'SPENDING'), 0) AS spent,
                       COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'REFUND'), 0) AS refunded
                FROM reeve_event e""".formatted(EVENT_CURRENCY) + where + """
                 AND e.event_type IN ('FUNDING', 'SPENDING', 'REFUND') GROUP BY currency""",
                params, (rs, i) -> new CurrencyTotals(rs.getString("currency"),
                        rs.getBigDecimal("funded"), rs.getBigDecimal("spent"), rs.getBigDecimal("refunded")));
        totals.sort(Comparator.comparing(CurrencyTotals::getFunded).reversed());
        overview.setTotals(totals);

        overview.setByType(jdbc.query("""
                SELECT e.event_type AS label, COUNT(*) AS count FROM reeve_event e""" + where + """
                 GROUP BY e.event_type ORDER BY count DESC""", params, LABEL_COUNT));

        if (!totals.isEmpty()) {
            String primaryCurrency = totals.getFirst().getCurrency();
            overview.setPrimaryCurrency(primaryCurrency);
            MapSqlParameterSource monthlyParams = new MapSqlParameterSource(params.getValues())
                    .addValue("currency", primaryCurrency);
            overview.setMonthly(jdbc.query("""
                    SELECT TO_CHAR(e.date, 'YYYY-MM') AS month,
                           COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'FUNDING'), 0) AS funded,
                           COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'SPENDING'), 0) AS spent,
                           COALESCE(SUM(e.total_amount) FILTER (WHERE e.event_type = 'REFUND'), 0) AS refunded
                    FROM reeve_event e""" + where + """
                     AND e.date IS NOT NULL AND %s = :currency
                     GROUP BY month ORDER BY month""".formatted(EVENT_CURRENCY),
                    monthlyParams, (rs, i) -> new MonthAmounts(rs.getString("month"),
                            rs.getBigDecimal("funded"), rs.getBigDecimal("spent"), rs.getBigDecimal("refunded"))));
        }

        overview.setRecent(jdbc.query("""
                SELECT e.id, e.tx_hash, e.event_id, e.event_type, e.date, e.total_amount,
                       %s AS currency, COALESCE(e.funding_entity, e.vendor) AS counterparty,
                       e.organisation_id, o.name
                FROM reeve_event e
                LEFT JOIN reeve_organisation o ON o.id = e.organisation_id""".formatted(EVENT_CURRENCY) + where + """
                 ORDER BY e.date DESC NULLS LAST, e.creation_slot DESC NULLS LAST LIMIT %d"""
                .formatted(RECENT_LIMIT), params, (rs, i) -> RecentEvent.builder()
                .id(rs.getLong("id"))
                .txHash(rs.getString("tx_hash"))
                .eventId(rs.getString("event_id"))
                .eventType(rs.getString("event_type"))
                .date(toLocalDate(rs.getDate("date")))
                .totalAmount(rs.getBigDecimal("total_amount"))
                .currency(rs.getString("currency"))
                .counterparty(rs.getString("counterparty"))
                .organisationId(rs.getString("organisation_id"))
                .organisationName(rs.getString("name"))
                .build()));

        return overview;
    }

    private static final RowMapper<LabelCount> LABEL_COUNT =
            (rs, i) -> new LabelCount(rs.getString("label"), rs.getLong("count"));

    private static final RowMapper<MonthCount> MONTH_COUNT =
            (rs, i) -> new MonthCount(rs.getString("month"), rs.getLong("count"));

    private static LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private static long nz(Long value) {
        return value == null ? 0L : value;
    }
}
