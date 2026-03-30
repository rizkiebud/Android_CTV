# Mobile Jaga 🏠🔐

Aplikasi keamanan rumah berbasis React Native 0.73.6 dengan monitoring CCTV lengkap.

## Fitur Utama

### 🔐 Autentikasi
- Login dengan email & password
- Login biometrik (sidik jari / Face ID) via `react-native-biometrics`
- Validasi form real-time dengan error message
- Animasi loading & shake pada error
- Demo: `rizki@mobilejaga.id` / `password123`

### 🏠 Dashboard
- Status sistem keamanan real-time (toggle armed/disarmed)
- Statistik kamera (total/online/merekam/offline)
- Aksi cepat: Mode siaga, kunci pintu, lampu, gerbang
- Preview live kamera 2x2 dengan badge LIVE & REC
- Grafik aktivitas 7 hari (`react-native-chart-kit`)
- Daftar peringatan terbaru

### 📹 Monitoring CCTV
**List Kamera:**
- Grid view & List view (toggle)
- Filter: Semua / Online / Offline / Merekam
- Pencarian kamera real-time
- Badge: LIVE, REC, Gerakan, Baterai kritis
- Status bar statistik kamera

**Detail Kamera (4 Tab):**
- **Live** — Streaming player dengan HUD overlay, PTZ control (pan/tilt), zoom slider, snapshot, record, mute, share
- **Rekaman** — Timeline rekaman dengan filter tanggal, putar & unduh clip
- **Pengaturan** — Night vision, audio, deteksi gerakan, rekaman otomatis, resolusi, FPS
- **Info** — Spesifikasi lengkap, status baterai, lokasi, jaringan

### 🔔 Peringatan
- Filter berdasarkan kategori (Gerakan/Offline/Baterai/Sistem)
- Badge unread count di tab bar
- Level keparahan dengan warna (Tinggi/Sedang/Rendah)
- Tandai dibaca / hapus individual atau semua
- Navigasi langsung ke kamera terkait

### 👤 Profil
- Info user dengan avatar inisial & plan berlangganan
- Statistik penggunaan (kamera, rekaman, hari aktif)
- Status penyimpanan cloud dengan progress bar
- Keamanan akun (2FA, biometrik, ganti password)
- Pengaturan notifikasi per kategori
- Menu lengkap (akun, aplikasi, bantuan)

## Stack Teknologi

| Package | Versi | Kegunaan |
|---------|-------|----------|
| react-native | 0.73.6 | Framework utama |
| @react-navigation/native | ^6.1.9 | Navigasi |
| @react-navigation/bottom-tabs | ^6.5.11 | Tab bar bawah |
| @react-navigation/native-stack | ^6.9.17 | Stack navigator |
| react-native-vector-icons | ^10.0.3 | Ikon Material Community |
| react-native-linear-gradient | ^2.8.3 | Gradient UI |
| react-native-reanimated | ^3.6.2 | Animasi smooth |
| react-native-gesture-handler | ^2.14.1 | Gesture handling |
| react-native-biometrics | ^3.0.1 | Fingerprint / Face ID |
| react-native-chart-kit | ^6.12.0 | Grafik aktivitas |
| react-native-svg | ^14.1.0 | SVG support untuk chart |
| react-native-video | ^5.2.1 | Video playback |
| @react-native-community/slider | ^4.5.0 | Zoom slider |
| @react-native-async-storage/async-storage | ^1.21.0 | Penyimpanan lokal |
| moment | ^2.30.1 | Format tanggal/waktu |

## Struktur Proyek

```
src/
├── context/
│   ├── AuthContext.js      # Auth state (login, logout, biometric)
│   └── AppContext.js       # App state (cameras, alerts, system)
├── navigation/
│   ├── index.js            # Root navigator
│   ├── AuthNavigator.js    # Stack: Login
│   └── MainNavigator.js    # Bottom tabs + stacks
├── screens/
│   ├── auth/
│   │   └── LoginScreen.js
│   └── main/
│       ├── DashboardScreen.js
│       ├── CameraListScreen.js
│       ├── CameraDetailScreen.js  # 4 tabs: Live, Rekaman, Pengaturan, Info
│       ├── AlertsScreen.js
│       └── ProfileScreen.js
└── utils/
    ├── colors.js           # Design system warna
    └── mockData.js         # Data simulasi kamera, peringatan, rekaman
```

## Instalasi & Menjalankan

### Prasyarat
- Node.js >= 18
- React Native CLI
- Android Studio (untuk Android) / Xcode (untuk iOS)
- JDK 17

### Langkah Instalasi

```bash
# 1. Clone / masuk ke direktori
cd Android_CTV

# 2. Install dependencies
npm install

# 3. Untuk iOS (macOS saja)
cd ios && pod install && cd ..

# 4. Link vector icons (Android)
# Tambahkan ke android/app/build.gradle:
# apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

# 5. Jalankan Metro
npm start

# 6. Jalankan di Android
npm run android

# 7. Jalankan di iOS
npm run ios
```

### Setup Vector Icons Android

Di `android/app/build.gradle`, tambahkan sebelum baris terakhir:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Konfigurasi Biometrik Android

Di `android/app/src/main/AndroidManifest.xml` sudah ditambahkan:
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

## Kredensial Demo

| Email | Password |
|-------|----------|
| rizki@mobilejaga.id | password123 |
| admin@test.com | admin |

## Tema

Aplikasi menggunakan tema gelap (dark theme) sepenuhnya dengan palet warna:
- Background: `#0A0E1A`
- Surface: `#161D2E`
- Card: `#111827`
- Primary: `#1A73E8`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Danger: `#EF4444`
