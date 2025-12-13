import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export async function signIn() {
  const provider = new GoogleAuthProvider()
  const auth = getAuth()
  // Use user's browser default language to display auth
  auth.useDeviceLanguage()

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result)
      // const token = credential.accessToken
      // The signed-in user info.
      console.log('DEBUG ONLY: result.user')
      console.log(result.user)
      return result.user
    })
    .catch((error) => {
      console.error('Auth error!')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error email:', error.customData.email)
    })
}
