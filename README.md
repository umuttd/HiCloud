# AI Destekli Bulut Depolama Sistemi

## 📖 Proje Tanımı
Bu çalışma, React 19 ve Next.js 15 tabanlı ön yüz ile Appwrite altyapısını birleştirerek,  
kullanıcıların farklı formatlardaki dosyaları güvenli bir bulut ortamına yükleyip yönetmesini sağlar.  
Yükleme sonrası OpenAI “gpt-4o-mini” modeliyle otomatik özet, anahtar kelime çıkarma  
ve kategori atama işlemleri gerçekleştirerek AI destekli arama-filtreleme deneyimi sunar .

## 🏛️ Mimari Tasarım
Çok katmanlı mimari;  
- İstemci (Next.js)  
- İş mantığı (REST API + Appwrite)  
- Depolama & Kimlik (Appwrite Storage & Auth)  

![Şekil 2.1: Sistemin Genel Mimarisi](storage_management_solution-main/types/mimari.png)

## 🛠️ Kullanılan Teknolojiler
- **Front-end:** React 19, Next.js 15  
- **Back-end:** Appwrite Authentication, Database, Storage  
- **AI Analiz:** OpenAI GPT-4o-mini  

## 🖥️ Kullanıcı Arayüzleri

### 1. Giriş Ekranı
Basit, duyarlı bir tasarımla kullanıcı kaydı/girişi sağlar.  
![Şekil 3.1: Kullanıcı Giriş Arayüzü](storage_management_solution-main/types/login.png) :contentReference[oaicite:0]{index=0}

### 2. OTP Doğrulama Modalı
E-posta ile tek seferlik şifre gönderimi ve doğrulama için modal pencere.  
![Şekil 3.2: OTP Modal Pencere](storage_management_solution-main/types/otp_modal.png) :contentReference[oaicite:1]{index=1}

### 3. Ana Sayfa
Dosya yükleme, indirme, arama-filtreleme ve AI analiz sonuçlarını görüntüleyen pano.  
![Şekil 3.3: Ana Sayfa Arayüzü](storage_management_solution-main/types/homepage.png) :contentReference[oaicite:2]{index=2}

### 4. AI Destekli İçerik Analizi
Yükleme sonrası dosya içeriği, OpenAI “gpt-4o-mini” modeli kullanılarak otomatik özetlenir, anahtar kelimelere ayrılır ve uygun kategoriye atanır .  
![Şekil 3.4: AI Analiz Sonuçları](storage_management_solution-main/types/ai_analysis.png)

## 🚀 Kurulum & Çalıştırma
1. Depoyu klonlayın  
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/ai-destekli-bulut-depolama.git
   cd ai-destekli-bulut-depolama
