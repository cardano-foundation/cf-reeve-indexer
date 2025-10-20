package org.cardanofoundation.reeve.indexer.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import co.nstant.in.cbor.model.Array;
import co.nstant.in.cbor.model.DataItem;
import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.exception.CborDeserializationException;
import com.bloxbean.cardano.client.plutus.spec.BigIntPlutusData;
import com.bloxbean.cardano.client.plutus.spec.BytesPlutusData;
import com.bloxbean.cardano.client.plutus.spec.ConstrPlutusData;
import com.bloxbean.cardano.client.plutus.spec.ListPlutusData;
import com.bloxbean.cardano.client.plutus.spec.PlutusData;
import com.bloxbean.cardano.client.util.HexUtil;
import com.bloxbean.cardano.yaci.store.script.storage.impl.model.TxScriptEntity;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.model.AddressUtxoEntity;
import org.apache.commons.lang3.math.Fraction;

import org.cardanofoundation.reeve.indexer.model.repository.CustomAddressUtxoRepository;
import org.cardanofoundation.reeve.indexer.model.repository.CustomTxScriptRepository;
import org.cardanofoundation.reeve.indexer.model.response.DataResponse;

@Slf4j
@RequiredArgsConstructor
@Service
public class ContractService {


    private final CustomAddressUtxoRepository customAddressUtxoRepository;
    private final CustomTxScriptRepository customTxScriptRepository;

    public DataResponse getCurrentDataForAssetName(String assetName) {
        var optUtxo = customAddressUtxoRepository.findLatestByAssetName(assetName);
        if (optUtxo.isEmpty())
            return null;
        var utxo = optUtxo.get();
        DataResponse response = new DataResponse();
        response.setTimestamp(java.time.Instant.ofEpochSecond(utxo.getBlockTime())
                .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        try {
            response.setDatumData(parseDatum(utxo.getInlineDatum()));
        } catch (CborDeserializationException e) {
            log.error("error parsing tx: {}".formatted(utxo.getTxHash()));
        }
        return response;
    }

    public DataResponse getCurrentRedeemerDataForAssetName(String assetName) {
        Optional<AddressUtxoEntity> latestByAssetName =
                customAddressUtxoRepository.findLatestByAssetName(assetName);
        if (latestByAssetName.isEmpty())
            return null;
        AddressUtxoEntity utxo = latestByAssetName.get();
        Optional<TxScriptEntity> latestByTxHash =
                customTxScriptRepository.findLatestByTxHash(utxo.getTxHash());
        if (latestByTxHash.isEmpty())
            return null;
        TxScriptEntity scriptEntity = latestByTxHash.get();

        DataResponse response = new DataResponse();
        response.setTimestamp(java.time.Instant.ofEpochSecond(utxo.getBlockTime())
                .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        try {
            response.setRedeemerData(parseRedeemer(scriptEntity.getRedeemerCbor()));
        } catch (CborDeserializationException e) {
            e.printStackTrace();
        }
        return response;
    }

    public List<DataResponse> getDataForAssetName(String assetName) {
        List<AddressUtxoEntity> utxos = customAddressUtxoRepository.findByAssetName(assetName);
        return utxos.stream().map(utxo -> {
            DataResponse response = new DataResponse();
            response.setTimestamp(java.time.Instant.ofEpochSecond(utxo.getBlockTime())
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
            try {
                response.setDatumData(parseDatum(utxo.getInlineDatum()));
            } catch (CborDeserializationException e) {
                log.error("error parsing tx: {}".formatted(utxo.getTxHash()));
            }
            return response;
        }).toList();
    }

    private Map<String, Double> parseRedeemer(String redeemerData)
            throws CborDeserializationException {
        Map<String, Double> result = new HashMap<>();
        DataItem di = CborSerializationUtil.deserialize(HexUtil.decodeHexString(redeemerData));
        ListPlutusData list = ListPlutusData.deserialize((Array) di);
        ConstrPlutusData dataConstr = (ConstrPlutusData) list.getPlutusDataList().get(2);
        ListPlutusData actualData =
                (ListPlutusData) dataConstr.getData().getPlutusDataList().getFirst();
        actualData.getPlutusDataList().forEach(pl -> {
            ConstrPlutusData data = (ConstrPlutusData) pl;
            List<PlutusData> constrList = data.getData().getPlutusDataList();
            BytesPlutusData name = (BytesPlutusData) constrList.get(0);
            int num = ((BigIntPlutusData) constrList.get(1)).getValue().intValue();
            int denom = ((BigIntPlutusData) constrList.get(2)).getValue().intValue();
            Fraction fraction = Fraction.getFraction(num, denom);
            result.put(new String(name.getValue()), fraction.doubleValue());
        });
        return result;
    }

    private Map<String, Double> parseDatum(String inlineDatum) throws CborDeserializationException {
        Map<String, Double> result = new HashMap<>();
        DataItem di = CborSerializationUtil.deserialize(HexUtil.decodeHexString(inlineDatum));
        var constr = ConstrPlutusData.deserialize(di);
        List<PlutusData> plutusDataList = constr.getData().getPlutusDataList();
        if (plutusDataList.size() != 3)
            return result;
        ListPlutusData dataList = (ListPlutusData) plutusDataList.getLast();
        dataList.getPlutusDataList().stream().forEach(pl -> {
            ConstrPlutusData data = (ConstrPlutusData) pl;
            List<PlutusData> constrList = data.getData().getPlutusDataList();
            BytesPlutusData name = (BytesPlutusData) constrList.get(0);
            int num = ((BigIntPlutusData) constrList.get(1)).getValue().intValue();
            int denom = ((BigIntPlutusData) constrList.get(2)).getValue().intValue();
            Fraction fraction = Fraction.getFraction(num, denom);
            result.put(new String(name.getValue()), fraction.doubleValue());
        });
        return result; // Implement actual parsing logic here
    }

}
