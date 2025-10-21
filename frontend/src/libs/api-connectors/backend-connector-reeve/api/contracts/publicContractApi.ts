import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import { ContractResponse, Organisation } from './publicContractApi.types'

export const ContractAPI = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getAssets = () => {
    return get<String[]>(`api/v1/assets`)
  }

  const getOrganisationByAssetName = (assetName: String) => {
    return get<Organisation>(`api/v1/assets/${assetName}/organisation`)
  }

  const getCurrentDatum = (tokenName: String) => {
    return get<ContractResponse>(`api/v1/assets/${tokenName}/datum/current`)
  }

  const getDatumHistory = (tokenName: String) => {
    return get<ContractResponse[]>(`api/v1/assets/${tokenName}/datum/history`)
  }

  const getCurrentRedeemer = (tokenName: String) => {
    return get<ContractResponse>(`api/v1/assets/${tokenName}/redeemer/current`)
  }

  return {
    getAssets,
    getOrganisationByAssetName,
    getCurrentDatum,
    getCurrentRedeemer,
    getDatumHistory
  }
}
