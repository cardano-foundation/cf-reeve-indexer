# KERI Identifier Verification

To verify KERI identifiers on the Cardano Mainnet, you need to resolve their corresponding OOBIs (Out Of Band Identifiers). Below is a list of known OOBIs for various entities operating on the Cardano Mainnet.
These OOBIs are essential for establishing trust and verifying the authenticity of the identifiers.
They must be added to the runtime environment to ensure proper resolution and verification.

A reference implementation how the verification of a vLEI is done can be found [here](./src/main/java/org/cardanofoundation/reeve/indexer/service/KeriService.java)

## Mainnet OOBIs
This is a list of OOBIs (Out Of Band Identifiers) for various entities which are already in use on the Cardano Mainnet.
OOBIs are used in the KERI (Key Event Receipt Infrastructure) framework to facilitate secure and verifiable interactions between decentralized identifiers (DIDs).
It is mandatory to resolve them otherwise the identifiers won't be known to your system.

- GLEIF - GLEIF is the global trust anchor that defines the governance and issues vLEI credentials through Qualified vLEI Issuers like Provenant.
  - https://gleif-it.github.io/.well-known/keri/oobi/EINmHd5g7iV-UldkkkKyBIH052bIyxZNBn9pq-zNrYoS
- Provenant -  a Qualified vLEI Issuer (QvLEI-I) that issues verifiable LEI credentials on behalf of the Global Legal Entity Identifier Foundation (GLEIF).
  - http://euro.origincloud.net:3902/oobi/ED88Jn6CnWpNbSYz6vp9DOSpJH2_Di5MSwWTf1l34JJm
- Grant Thornton Legal Entity - An audited legal entity registered with GLEIF.
- Grant Thornton Reeve Identifier - a decentralized identifier managed by Grant Thornton which is used for onChain Audits
  - https://keria-ext.pro.cf-lob.eu-west-1.app.reeve.technology/oobi/ENDdL-55S7EQA8pnyrBpuSL5DzI_kkA4R7NXIpOELAV1/agent/ECue2GzBmCGx0ceTnnTf-Bts8f--A3vhN-_9qyIHTw10


## How to use it
