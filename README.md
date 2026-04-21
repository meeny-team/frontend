# Meeny - Z세대 소비 공유 앱

React Native로 구축된 소비 공유 앱입니다.

## 기능

- 그룹별 소비 피드
- 월별 캘린더 뷰
- 소셜 로그인 (카카오, 애플)
- 프로필 관리

---

## 개발 환경 설정

### 공통 사전 요구사항

- **Node.js** v22 이상 (권장: LTS 버전)
- **npm** 또는 **yarn**

---

## macOS 설치 가이드

### 1. Homebrew 설치 (없는 경우)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Node.js 설치

```bash
# nvm 사용 권장
brew install nvm
nvm install 22
nvm use 22

# 또는 직접 설치
brew install node@22
```

### 3. Watchman 설치 (파일 변경 감지)

```bash
brew install watchman
```

### 4. iOS 개발 환경 (Xcode)

```bash
# App Store에서 Xcode 설치 후
xcode-select --install

# iOS 시뮬레이터 설치 확인
xcrun simctl list devices
```

### 5. CocoaPods 설치 (iOS 종속성 관리)

```bash
# Ruby gem으로 설치
sudo gem install cocoapods

# 또는 Homebrew로
brew install cocoapods
```

### 6. 프로젝트 설치 및 실행

```bash
# 프로젝트 폴더로 이동
cd /path/to/meeny/mobile

# 종속성 설치
npm install

# iOS 종속성 설치
cd ios
bundle install         # 처음 한번만
bundle exec pod install
cd ..

# iOS 시뮬레이터 실행
npx react-native run-ios

# 특정 시뮬레이터 지정
npx react-native run-ios --simulator="iPhone 16"
```

### 7. Android 개발 환경 (선택사항)

```bash
# Android Studio 설치 (https://developer.android.com/studio)
# 설치 후 SDK Manager에서 다음 설치:
# - Android SDK Platform 34
# - Android SDK Build-Tools 34.0.0
# - Android Emulator
# - Android SDK Platform-Tools

# 환경변수 설정 (~/.zshrc 또는 ~/.bash_profile)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Android 에뮬레이터 실행
npx react-native run-android
```

---

## Windows 설치 가이드

### 1. Chocolatey 설치 (패키지 관리자)

PowerShell(관리자 권한)에서 실행:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

### 2. Node.js 및 JDK 설치

```powershell
# Node.js LTS
choco install nodejs-lts

# OpenJDK 17 (Android 빌드용)
choco install openjdk17
```

### 3. Android Studio 설치

1. [Android Studio](https://developer.android.com/studio) 다운로드 및 설치
2. SDK Manager에서 설치:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM)

### 4. 환경변수 설정

시스템 환경변수에 추가:

```
ANDROID_HOME = C:\Users\<사용자명>\AppData\Local\Android\Sdk
Path에 추가:
- %ANDROID_HOME%\emulator
- %ANDROID_HOME%\platform-tools
```

### 5. 프로젝트 설치 및 실행

```powershell
# 프로젝트 폴더로 이동
cd C:\path\to\meeny\mobile

# 종속성 설치
npm install

# Android 에뮬레이터 시작 (Android Studio에서)
# 또는 연결된 실제 기기 사용

# Android 앱 실행
npx react-native run-android
```

> **참고**: Windows에서는 iOS 빌드가 불가능합니다. iOS 앱 개발은 macOS가 필요합니다.

---

## 프로젝트 구조

```
mobile/
├── App.tsx                 # 앱 진입점
├── src/
│   ├── navigation/         # React Navigation
│   │   ├── Navigation.tsx
│   │   ├── AuthorizedStack.tsx
│   │   ├── UnauthorizedStack.tsx
│   │   └── BottomTabs.tsx
│   │
│   ├── screens/            # 화면 컴포넌트
│   │   ├── Login/
│   │   ├── Feed/
│   │   ├── Calendar/
│   │   └── MyProfile/
│   │
│   ├── components/         # 공통 컴포넌트
│   │   └── ExpenseCard.tsx
│   │
│   ├── design/             # 디자인 시스템
│   │   ├── Stack.tsx       # HStack, VStack
│   │   ├── Button.tsx
│   │   ├── Typo.tsx
│   │   └── token/
│   │       ├── colors.ts
│   │       └── theme.ts
│   │
│   ├── auth/               # 인증 Context
│   │   └── Auth.tsx
│   │
│   └── data/               # 더미 데이터
│       └── dummy.ts
└── ios/                    # iOS 네이티브 코드
└── android/                # Android 네이티브 코드
```

---

## 주요 명령어

```bash
# 개발 서버 시작
npx react-native start

# iOS 실행
npx react-native run-ios

# Android 실행
npx react-native run-android

# Metro 캐시 초기화
npx react-native start --reset-cache

# iOS Pod 재설치
cd ios && pod install --repo-update && cd ..

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```

---

## 문제 해결

### iOS 빌드 오류

```bash
# CocoaPods 캐시 정리
cd ios
pod cache clean --all
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..
```

### Android 빌드 오류

```bash
# Gradle 캐시 정리
cd android
./gradlew clean
cd ..
```

### Metro 번들러 오류

```bash
# Watchman 캐시 정리
watchman watch-del-all

# node_modules 재설치
rm -rf node_modules
npm install
```

---

## 기술 스택

- **React Native** 0.85.x
- **React Navigation** 7.x
- **TypeScript**
- **Gesture Handler & Reanimated**

---

## 라이선스

© 2024 Meeny. All rights reserved.
