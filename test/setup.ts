import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// Sandbox HOME so no test can ever read, revoke, or delete the developer's real
// stored credentials (~/.id.org.ai/token, ~/.oauth.do/token). clearCredentials()
// and the oauth module's default storage both resolve paths from os.homedir().
const sandboxHome = mkdtempSync(join(tmpdir(), 'auto-dev-sdk-test-home-'))
process.env.HOME = sandboxHome
process.env.USERPROFILE = sandboxHome
