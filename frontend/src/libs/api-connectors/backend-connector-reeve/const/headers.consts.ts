export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum MediaTypes {
  APPLICATION_JSON = 'application/json',
  APPLICATION_JSON_UTF8 = 'application/json;charset=UTF-8',
  APPLICATION_JSON_UTF8_FORM_URLENCODED = 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  APPLICATION_OCTET_STREAM = 'application/octet-stream'
}

export enum Headers {
  CONTENT_TYPE = 'Content-Type',
  CONTENT_LENGTH = 'Content-Length',
  ACCEPT = 'Accept'
}

type ContentTypeHeaders = Record<Headers, MediaTypes>

export const DEFAULT_CONTENT_TYPE_HEADERS: Partial<ContentTypeHeaders> = {
  [Headers.CONTENT_TYPE]: MediaTypes.APPLICATION_JSON
}
