const { withAppBuildGradle } = require("expo/config-plugins");

const ENV_BLOCK = `
// AGNI_RELEASE_SIGNING_ENV_BEGIN
def agniReleaseKeystore = System.getenv("AGNI_ANDROID_KEYSTORE_FILE")
def agniReleaseStorePassword = System.getenv("AGNI_ANDROID_STORE_PASSWORD")
def agniReleaseKeyAlias = System.getenv("AGNI_ANDROID_KEY_ALIAS")
def agniReleaseSigningReady = [
    agniReleaseKeystore,
    agniReleaseStorePassword,
    agniReleaseKeyAlias
].every { value -> value != null && !value.trim().isEmpty() }
def agniReleaseRequested = gradle.startParameter.taskNames.any {
    task -> task.toLowerCase().contains("release")
}
// AGNI_RELEASE_SIGNING_ENV_END
`;

const DEBUG_SIGNING = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const RELEASE_SIGNING = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (agniReleaseSigningReady) {
                storeFile file(agniReleaseKeystore)
                storePassword agniReleaseStorePassword
                keyAlias agniReleaseKeyAlias
                // PKCS12 private key is intentionally protected by the store password.
                keyPassword agniReleaseStorePassword
                storeType "pkcs12"
            }
        }
    }`;

const DEFAULT_RELEASE = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const HARDENED_RELEASE = `        release {
            if (agniReleaseRequested && !agniReleaseSigningReady) {
                throw new GradleException("AGNI_RELEASE_SIGNING_REQUIRED")
            }
            if (agniReleaseSigningReady) {
                signingConfig signingConfigs.release
            }`;

module.exports = function withAgniReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== "groovy") {
      throw new Error("AGNI release signing requires Groovy app/build.gradle");
    }

    let source = mod.modResults.contents;

    if (!source.includes("AGNI_RELEASE_SIGNING_ENV_BEGIN")) {
      const anchor = "\nandroid {";
      const index = source.indexOf(anchor);
      if (index < 0) throw new Error("AGNI release signing could not find android block");
      source = source.slice(0, index) + ENV_BLOCK + source.slice(index);
    }

    if (!source.includes("storeFile file(agniReleaseKeystore)")) {
      if (!source.includes(DEBUG_SIGNING)) {
        throw new Error("AGNI release signing could not find default signing config");
      }
      source = source.replace(DEBUG_SIGNING, RELEASE_SIGNING);
    }

    if (!source.includes("AGNI_RELEASE_SIGNING_REQUIRED")) {
      if (!source.includes(DEFAULT_RELEASE)) {
        throw new Error("AGNI release signing could not find default release build type");
      }
      source = source.replace(DEFAULT_RELEASE, HARDENED_RELEASE);
    }

    mod.modResults.contents = source;
    return mod;
  });
};
