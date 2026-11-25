import type { DecryptOutcome } from 'libs/document-vault-crypto/decrypt'
import { buildDownloadFilename } from 'modules/public-document-detail/constants/detail.consts.ts'
import { downloadTypeOf, UNKNOWN_DOWNLOAD_TYPE } from 'modules/public-document-detail/utils/content.ts'

/**
 * Hands the decrypted bytes to the browser as a file download, named and typed by their content.
 *
 * Bytes that do not match the on-chain plaintext hash always save as `.bin`: they are offered only so
 * they can be inspected deliberately, and a real extension would let a double-click hand
 * unverified content straight to a native application.
 */
export const saveDecryptedFile = (documentId: string, { plaintext, plaintextHashMatches }: Pick<DecryptOutcome, 'plaintext' | 'plaintextHashMatches'>) => {
  const { extension, mediaType } = plaintextHashMatches ? downloadTypeOf(plaintext) : UNKNOWN_DOWNLOAD_TYPE
  // Re-wrap: DecryptOutcome types plaintext as Uint8Array<ArrayBufferLike>; BlobPart requires
  // Uint8Array<ArrayBuffer> (TS 5.7+ generic-buffer typing only, same bytes) - see decrypt.ts.
  const blob = new Blob([new Uint8Array(plaintext)], { type: mediaType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildDownloadFilename(documentId, extension)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
