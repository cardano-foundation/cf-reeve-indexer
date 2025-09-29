export interface GlossaryItem {
  term: string
  category: string
  definition: string
}

export const glossaryData: GlossaryItem[] = [
  {
    term: 'Amount',
    category: 'Transactions',
    definition: 'The monetary value of the transaction, expressed in the foreign currency specified in the <strong>Currency</strong> field.'
  },
  {
    term: 'Asset',
    category: 'Reports',
    definition:
      'A resource with economic value that an organization owns or controls with expectation of future benefit.\n\n' +
      '- <strong>Current Assets</strong>: Assets expected to be converted to cash or used within one year.\n' +
      '- <strong>Non-Current Assets</strong>: Assets held for longer than one year.'
  },
  {
    term: 'Balance Sheet',
    category: 'Reports',
    definition:
      "A financial statement that summarizes an organization's assets, liabilities, and equity (or capital) at a specific point in time. It adheres to the fundamental accounting equation:\n\n" +
      '<i>Assets = Liabilities + Equity or Capital</i>'
  },
  {
    term: 'Browser',
    category: '',
    definition: 'A software application used to access and display web pages on the internet. Popular examples include Chrome, Firefox, Safari, and Edge.'
  },
  {
    term: 'Capital',
    category: 'Reports',
    definition: "The portion of a company's assets that an owner can claim. It's calculated by subtracting the organization's liabilities from its assets."
  },
  {
    term: 'Cookie',
    category: '',
    definition: "A small piece of data sent from a website and stored on a user's computer by their web browser while they are browsing."
  },
  {
    term: 'Cost Centre',
    category: 'Transactions',
    definition:
      'Represents an internal organizational unit to which costs are allocated for accounting and management purposes. Assigning a cost center helps track expenses and revenues within different parts of the organization.'
  },
  {
    term: 'Counterparty',
    category: 'Transactions',
    definition:
      'Any individual or entity that is a party to an accounting transaction with the organization.\n\n' +
      ' - <strong>Counterparty ID</strong>: A unique identifier for the counterparty in Reeve ID.\n' +
      ' - <strong>Counterparty Type</strong>: A classification that helps in the classification and analysis of transactions (e.g., Customer, Vendor).'
  },
  {
    term: 'Currency',
    category: '',
    definition:
      'A unit of money used as a medium of exchange. In Reeve, transactions can be recorded in various currencies:\n\n' +
      ' - <strong>Transaction Currency (Transactions)</strong>: The specific currency in which a particular transaction originally took place.\n' +
      " - <strong>Base Currency (Reports)</strong>: The primary currency in which the organization's financial records and reports are maintained. Transaction amounts in foreign currencies are converted to the <strong>Base Currency</strong> using the applicable <strong>Exchange Rate</strong>."
  },
  {
    term: 'Document',
    category: 'Transactions',
    definition: 'A unique reference number assigned to the source document associated with a transaction. This helps trace the transaction back to its origin.'
  },
  {
    term: 'Event Code',
    category: 'Transactions',
    definition: 'An internal code used to categorize transactions based on specific events or business activities.'
  },
  {
    term: 'Exchange Rate',
    category: 'Transactions',
    definition: 'The rate at which one currency is exchanged for another at the time of a transaction. This rate is used to convert a foreign currency amount to the base currency.'
  },
  {
    term: 'Income Statement',
    category: 'Reports',
    definition: "A financial report that tracks the organization's revenues, expenses, gains, and losses during a specific period."
  },
  {
    term: 'Liability',
    category: 'Reports',
    definition:
      'A present obligation of an entity, arising from past events, that is expected to result in an outflow or reduction of economic benefit.\n\n' +
      ' - <strong>Current Liabilities</strong>: Obligations due within one year.\n' +
      ' - <strong>Non-Current Liabilities</strong>: Obligations due after one year.'
  },
  {
    term: 'Project Code',
    category: 'Transactions',
    definition:
      'An internal code used to identify and track financial activities related to a specific project. This allows for monitoring the financial performance of individual projects.'
  },
  {
    term: 'Transaction Date',
    category: 'Transactions',
    definition: 'The date on which the accounting transaction occurred or was recorded in the system.'
  },
  {
    term: 'Transaction Hash',
    category: 'Transactions',
    definition:
      'A unique cryptographic identifier assigned to each transaction recorded on the blockchain. This hash ensures the transaction&apos;s integrity and allows for its permanent and verifiable tracking.'
  },
  {
    term: 'Transaction Number',
    category: 'Transactions',
    definition:
      'A unique sequential number assigned to each accounting transaction within the ERP/Accounting system for internal tracking and identification. This number is typically system-generated and aids in auditing and referencing specific transactions.'
  },
  {
    term: 'Transaction Type',
    category: 'Transactions',
    definition: 'The classification of the accounting transaction, indicating its nature (e.g., Bill, Payment, Journal, Credit Bill).'
  },
  {
    term: 'VAT (Value Added Tax)',
    category: 'Transactions',
    definition:
      'A consumption tax levied on goods and services. Businesses registered for VAT generally collect this tax from their customers and then remit it to the tax authorities. They can also reclaim VAT paid on their own business expenses.\n\n' +
      ' - <strong>VAT Code</strong>: An internal identifier used to categorize transactions based on their specific VAT treatment. This code helps the ERP/Accounting system apply the correct tax rules and track VAT liabilities and receivables.\n' +
      ' - <strong>VAT Rate</strong>: The percentage at which VAT is charged on the value of goods or services. Different rates may apply depending on the type of goods or services and the jurisdiction.'
  }
]
