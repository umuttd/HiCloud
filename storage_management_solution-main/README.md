1  # AI Destekli Bulut Depolama Sistemi
2  
3  ## 📖 Proje Tanımı  
4  Bu çalışma, React 19 ve Next.js 15 tabanlı ön yüz ile Appwrite altyapısını birleştirerek,  
5  kullanıcıların farklı formatlardaki dosyaları güvenli bir bulut ortamına yükleyip yönetmesini sağlar.  
6  Yükleme sonrası OpenAI “gpt-4o-mini” modeliyle otomatik özet, anahtar kelime çıkarma  
7  ve kategori atama işlemleri gerçekleştirerek AI destekli arama-filtreleme deneyimi sunar :contentReference[oaicite:0]{index=0}.  
8  
9  ## 🏛️ Mimari Tasarım  
10 Çok katmanlı mimari;  
11  - İstemci (Next.js)  
12  - İş mantığı (REST API + Appwrite)  
13  - Depolama & Kimlik (Appwrite Storage & Auth)  
14  
15 ![Şekil 2.1: Sistemin Genel Mimarisi](assets/images/mimari.png)  <!-- satır 15 -->  
16  
17 ## 🛠️ Kullanılan Teknolojiler  
18 - **Front-end:** React 19, Next.js 15  
19 - **Back-end:** Appwrite Authentication, Database, Storage  
20 - **AI Analiz:** OpenAI GPT-4o-mini  
21  
22 ## 🖥️ Kullanıcı Arayüzleri  
23  
24 ### 1. Giriş Ekranı  
25 Basit, duyarlı bir tasarımla kullanıcı kaydı/girişi sağlar.  
26 ![Şekil 3.1: Kullanıcı Giriş Arayüzü](assets/images/login.png)  <!-- satır 26 --> :contentReference[oaicite:1]{index=1}  
27  
28 ### 2. OTP Doğrulama Modalı  
29 E-posta ile tek seferlik şifre gönderimi ve doğrulama için modal pencere.  
30 ![Şekil 3.2: OTP Modal Pencere](assets/images/otp_modal.png)  <!-- satır 30 --> :contentReference[oaicite:2]{index=2}  
31  
32 ### 3. Ana Sayfa  
33 Dosya yükleme, indirme, arama-filtreleme ve AI analiz sonuçlarını görüntüleyen pano.  
34 ![Şekil 3.3: Ana Sayfa Arayüzü](assets/images/homepage.png)  <!-- satır 34 --> :contentReference[oaicite:3]{index=3}  
35  
36 ## 🚀 Kurulum & Çalıştırma  
37 1. Depoyu klonlayın  
38    ```bash
39    git clone https://github.com/KULLANICI_ADINIZ/ai-destekli-bulut-depolama.git
40    cd ai-destekli-bulut-depolama
41    ```  
42 2. Bağımlılıkları yükleyin  
43    ```bash
44    npm install
45    ```  
46 3. Ortam değişkenlerini ayarlayın (`.env.local`):  
47    ```env
48    NEXT_PUBLIC_APPWRITE_ENDPOINT=…
49    NEXT_PUBLIC_APPWRITE_PROJECT=…
50    NEXT_PUBLIC_APPWRITE_BUCKET=…
51    OPENAI_API_KEY=…
52    ```  
53 4. Geliştirme sunucusunu başlatın  
54    ```bash
55    npm run dev
56    ```
57  
58 ## 📄 Lisans  
59 MIT © 2025 — Umut Deniz
