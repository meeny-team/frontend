# Deep Links — Universal Links (iOS) / App Links (Android)

크루 초대 URL 을 앱에서 바로 열도록 하는 세팅.

## 지원 URL

| 형태 | 용도 |
|---|---|
| `meeny://invite/{code}` | 커스텀 스킴 — 카톡 공유 등에서 https 링크가 브라우저를 거치는 케이스 fallback |
| `https://meeny.store/invite/{code}` | Universal / App Links — 정상 흐름 |
| `https://www.meeny.store/invite/{code}` | 위와 동일. www 서브도메인 |

라우팅은 `src/navigation/Navigation.tsx` 의 `linking` config 가 담당하고, 실제 조인 처리는 `src/screens/Home/HomeScreen.tsx` (`route.params.inviteCode` 감지).

## 서버 쪽 배포 파일

**⚠️ 반드시 도메인 루트에 배포해야 함** (`https://meeny.store/.well-known/...`). 리다이렉트 있으면 안 됨.

### `/.well-known/apple-app-site-association` (iOS Universal Links)

Content-Type: `application/json` (확장자 없음). Team ID + Bundle ID 조합이 `entitlements` 의 `applinks:` 와 짝을 이뤄야 함.

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "H9BH6JCN5C.com.meeny.app",
        "paths": [ "/invite/*" ]
      }
    ]
  }
}
```

검증:
```bash
curl -s https://app-site-association.cdn-apple.com/a/v1/meeny.store | jq .
# 또는
curl -sv https://meeny.store/.well-known/apple-app-site-association | jq .
```

### `/.well-known/assetlinks.json` (Android App Links)

Content-Type: `application/json`. `sha256_cert_fingerprints` 는 릴리스 서명 키 (upload key) 의 SHA-256.

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.meeny.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:...:FF"
      ]
    }
  }
]
```

Fingerprint 획득:
```bash
# 로컬 keystore
keytool -list -v -keystore /path/to/upload.keystore -alias upload | grep SHA256
# Play Console 에서 자동 서명 사용 시
# Play Console → 앱 → 릴리스 → 앱 서명 → 앱 서명 키 인증서 → SHA-256
```

검증:
```bash
curl -sv https://meeny.store/.well-known/assetlinks.json | jq .
# Google 의 statement list API
curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://meeny.store&relation=delegate_permission/common.handle_all_urls" | jq .
```

## 로컬 테스트

**iOS 시뮬레이터** — `apple-app-site-association` 파일이 도메인에 배포되어 있어야 Universal Links 가 활성화. 배포 전이면 커스텀 스킴만 테스트 가능:

```bash
xcrun simctl openurl booted "meeny://invite/ABC123"
```

**Android 에뮬레이터**:

```bash
# 커스텀 스킴
adb shell am start -W -a android.intent.action.VIEW -d "meeny://invite/ABC123"
# App Links (autoVerify 검증 결과 확인)
adb shell pm get-app-links com.meeny.app
# 강제로 App Links 재검증
adb shell pm verify-app-links --re-verify com.meeny.app
```

## 트러블슈팅

- iOS 에서 https 링크가 여전히 Safari 로 열림 → `apple-app-site-association` 캐시 문제. 앱 재설치 or `xcrun simctl uninstall booted com.meeny.app`.
- Android 에서 `pm get-app-links` 결과가 `verified=false` → assetlinks.json 문법/SHA-256 오류. Google 의 statement list API 로 크로스체크.
- 클릭 시 브라우저 뜨고 앱 진입 안 됨 → autoVerify 재검증 필요. 앱 재설치가 가장 확실.
