import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import JwksClient, { ISigningKeyPem } from 'jwks-client-browser'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-orqr71xnh46ghesl.us.auth0.com/.well-known/jwks.json'

// const jwksClient = new JwksClient({
//   url: jwksUrl
// })

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJSnHYaRbbOL+XMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1vcnFyNzF4bmg0NmdoZXNsLnVzLmF1dGgwLmNvbTAeFw0yMzA5Mjkw
NjM1MzVaFw0zNzA2MDcwNjM1MzVaMCwxKjAoBgNVBAMTIWRldi1vcnFyNzF4bmg0
NmdoZXNsLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOKparZg//3Nn0aCYg7IiEyAP+ki+o0AGxGGc6RiFsLwPXRSnPl1qYqv7gjw
NE20LvsVI1g6EFmn5zyZkul1bq1H/72ySt0z9AZpIWekK+VvXDmZZQ0vZYyDOrea
ykIgzAqA15j9VXlECuy9QBQBzPByw0Y535Ph1UwpVgJzK1Msycnd7tEtNgiZS6Pi
pO4QHsaglansj4dB1rAm5ef5aNn1jvgLRO/9544wrq5PyO1KEI19ci1YDNJ8q6F3
SVIKVaZRgJn40JoAZ6hE8eEOmPWtbBGomKJuBp6/eyTcy7t1WOKmk+FTXwMFNODl
nQrOMFfrR/WYtG8W2MK7VFVmrskCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUwEZRs+RlCecEhINzFFZeMRyw74swDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBv5V2GaiJ/sMrmzb8N9xpnVu9C+cC3fTmv8a/KXrWt
ayI8MoGEJLRrb9G4OYPn8JX91YmzELrRcwLNhycvFkWqaXQUi4ky7+G6MxXuFoHO
cpV1rK01kMbaGdqtAhEHEdX+rx5VJwbNIjkFHP6yEalY7O4yHtyAD+/T02bCiwDA
j5+VqdEw9Bzfit0hbXUfnnHT+fAwkLssutUUVBnIRxld+144msLlhW574L19LH07
2XyqWAkigHTAuQmtxsUSxAeAAkd/kPr6s6IaGbXlueqgqy7cYHjFR2CXfmj76eF+
XX1RXEJ7KzdHdOZkpQ1POfLJ0pxnmJ6Sz5F+kiLkEvDE
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const token = getToken(authHeader)
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
