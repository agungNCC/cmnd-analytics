# Export Mapping — LOG_VR_completion

Dokumen ini memetakan struktur file output `LOG_VR_completion_<yyyymmdd>.xlsx` agar sesuai workbook acuan `Mandatory LOG_VR Learning.xlsx` dan file referensi `frontend/public/reference_file.xlsx`.

---

## 1. Ringkasan Output

| Item | Nilai |
|---|---|
| **Filename** | `LOG_VR_completion_<yyyymmdd>.xlsx` (contoh: `LOG_VR_completion_20260819.xlsx`) |
| **Sheets** | `Summary All`, `Mandatory 2026`, `LOG+`, `VR Learning`, `<MC Sheet>` |
| **Sumber acuan** | `backend/samples/mandatory_reference.xlsx` |
| **Referensi master** | `frontend/public/reference_file.xlsx` (default; bisa di-replace via upload) |

### Urutan sheet (disarankan sama dengan acuan)

1. `Summary All`
2. `Mandatory 2026`
3. `LOG+`
4. `VR Learning`
5. `<MC Sheet>` — nama dinamis dari A1 referensi

---

## 2. File Referensi (MC Master)

### Lokasi default

```
frontend/public/reference_file.xlsx
```

Backend export **tidak** otomatis membaca `frontend/public/` dari container. Saat implementasi, salin/simpan referensi aktif ke path backend, misalnya:

```
backend/data/reference_file.xlsx
```

Metadata disimpan di DB/config:

| Field | Contoh |
|---|---|
| `reference_file_path` | `/app/data/reference_file.xlsx` |
| `reference_sheet_title` | `Monthly Closing Jul 2026` (dari A1) |
| `reference_sheet_name` | `MC Jul 26` (derived) |
| `uploaded_at` | timestamp |

### Aturan penamaan sheet dari A1

```
A1: "Monthly Closing Jul 2026"  →  sheet name: "MC Jul 26"
```

**Algoritma:**

```text
Input : "Monthly Closing <Mon> <YYYY>"
Output: "MC <Mon> <YY>"

Mon  = 3-letter month (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
YY   = 2 digit terakhir tahun
```

Contoh:

| A1 | Sheet name |
|---|---|
| Monthly Closing Jul 2026 | MC Jul 26 |
| Monthly Closing Aug 2026 | MC Aug 26 |
| Monthly Closing Jan 2027 | MC Jan 27 |

### Struktur sheet referensi

| Baris | Isi |
|---|---|
| 1 | Judul (`Monthly Closing Jul 2026`) di **A1** |
| 2 | Nomor kolom (1, 2, 3, …) — opsional |
| 3–4 | Header ganda (label HR) |
| 5+ | Data karyawan |

**Range lookup utama (sesuai acuan):** `'MC Jul 26'!$B$4:$AO$14905`

Kolom kunci:

| Kolom Excel | Header | Dipakai untuk |
|---|---|---|
| B | NIP | Primary key lookup |
| C | Emp Name | Mandatory col C |
| E | Directorate | — |
| F | Directorate Update | Mandatory col D (VLOOKUP index 5) |
| G | Sub Directorate | Mandatory col E |
| H | Group | Mandatory col F |
| I | Division | Mandatory col G |
| K | Job Name | Mandatory col H, I |
| U | DS NIP | Mandatory col O |
| V | DS Name | Mandatory col P |
| S | Parent Position Name | Mandatory col Q |
| X | Location | Mandatory col J |
| Y | Town or City | Mandatory col K |
| Z | Province | Mandatory col L |
| AC | Hire Date | Mandatory col M |
| AJ | Email Address | Mandatory col N |

---

## 3. Sheet LOG+ (Input / Update dari DB)

### Format acuan: **wide matrix** (bukan 1 baris per modul)

| Baris | Isi |
|---|---|
| 1–2 | Kosong |
| 3 | Header identitas: `NO`, `USERNAME`, `NAME`, `HIRE DATE`, `EMAIL`, `DIRECTORATE`, `SUB DIRECTORATE`, `STATUS ACTIVE`, `COMPLETION`, + header grup course |
| 4 | Sub-header course (nama program `- 2026`) |
| 5 | Sub-header modul (nama modul individual) |
| 6+ | Data karyawan |

### Kolom identitas (fixed)

| Kolom | Header row 3 | Keterangan |
|---|---|---|
| A | NO | Nomor urut |
| B | USERNAME | **NIP / Employee ID** — kunci VLOOKUP ke Mandatory |
| C | NAME | Nama karyawan |
| D | HIRE DATE | Tanggal hire |
| E | EMAIL | Email |
| F | DIRECTORATE | Direktorat (dari file upload) |
| G | SUB DIRECTORATE | Sub direktorat |
| H | STATUS ACTIVE | TRUE/FALSE |
| I | **COMPLETION** | **Overall LOG+ %** (contoh: `100.00%`) — **penting untuk Mandatory col S** |
| J+ | Course columns | Status per modul: `Completed YYYY-MM-DD HH:MM:SS (score)` |

### Mapping ke DB (saat upload)

Saat ini parser memecah wide → **1 baris per modul** (~240k baris). Untuk output yang benar:

| Kebutuhan | Rekomendasi |
|---|---|
| Simpan raw wide | Simpan file asli / snapshot wide di storage |
| Atau | Simpan 1 baris summary per karyawan + kolom `overall_completion` dari kolom **I (COMPLETION)** |
| Export LOG+ | Rebuild layout wide 3-baris header + data (sama seperti file upload) |

### VLOOKUP dari Mandatory 2026

```excel
S2 = VLOOKUP(B2,'LOG+'!$B$3:$AF$14988, 8, FALSE)
```

| Parameter | Nilai |
|---|---|
| Lookup value | NIP (`Mandatory!B2`) |
| Table | `'LOG+'!$B$3:$AF$...` |
| Col index | **8** → kolom **I = COMPLETION** |
| Hasil | Persentase LOG+ (contoh: `100%`, `0.00%`) |

**Status LOG+ (col R):**

```excel
R2 = IF(S2=100%,"Completed","Incompleted")
```

---

## 4. Sheet VR Learning (Input / Update dari DB)

### Format acuan: header 2 baris

| Baris | Isi |
|---|---|
| 1 | `NIK`, `Nama`, `Directorate`, `Sub-Directorate`, `Email`, `Region`, `Cabang`, `Forward 30`, (null), (null), `%` |
| 2 | (null)×7, `Score`, `Completion Time`, `Status`, (null) |
| 3+ | Data karyawan |

### Kolom data

| Kolom | Row 1 | Row 2 | Keterangan |
|---|---|---|---|
| A | NIK | — | Primary key |
| B | Nama | — | Nama |
| C | Directorate | — | |
| D | Sub-Directorate | — | |
| E | Email | — | |
| F | Region | — | |
| G | Cabang | — | Branch |
| H | Forward 30 | Score | Skor Forward 30 |
| I | — | Completion Time | Waktu (contoh: `21Jul26`) |
| J | — | Status | `Completed` / `Incompleted` |
| K | % | — | Persentase completion |

### VLOOKUP dari Mandatory 2026

```excel
T2 = VLOOKUP(B2,'VR Learning'!$A$1:$K$14999, 10, FALSE)   → Status (col J)
U2 = VLOOKUP(B2,'VR Learning'!$A$1:$K$14999, 11, FALSE)   → % (col K)
```

### Mapping ke DB (saat upload)

| Field DB | Sumber kolom VR |
|---|---|
| `employee_id` | A (NIK) |
| `employee_name` | B (Nama) |
| `directorate` | C |
| `sub_directorate` | D |
| `region` | F |
| `branch` | G |
| `forward_30_score` | H (Score) |
| `completion_time` | I |
| `completion_status` | J (Status) |
| `% completion` | K — simpan sebagai `completion_percentage` atau derive dari status |

---

## 5. Sheet Mandatory 2026

### Daftar karyawan (kolom B = NIP)

Di file acuan: **11.448 baris** NIP — semua ada di sheet MC (subset dari 12.755 MC rows).

**Sumber NIP untuk generate:**

- Opsi A (disarankan awal): semua NIP unik dari union `LOG+ USERNAME` + `VR NIK` yang ada di referensi MC
- Opsi B: semua NIP aktif dari referensi MC (filter `Status` jika ada)
- Opsi C: daftar NIP kurasi manual (seperti file acuan — perlu sumber list terpisah)

### Kolom header (23 kolom)

| Col | Header | Sumber | Formula / Rule |
|---|---|---|---|
| A | No | Auto | Nomor urut (1, 2, 3, …) |
| B | NIP | Input list | NIP karyawan |
| C | Emp Name | MC | `=VLOOKUP(B2,'<MC>'!$B$4:$AO$...,2,FALSE)` |
| D | Directorate | MC | VLOOKUP index **5** → col F (*Directorate Update*) |
| E | Sub Directorate | MC | index **6** → col G |
| F | Group | MC | index **7** → col H |
| G | Division | MC | index **8** → col I |
| H | Job Name | MC | index **10** → col K |
| I | Position Name | MC | index **10** → col K (sama dengan Job Name di acuan) |
| J | Location | MC | index **23** → col X |
| K | Town or City | MC | index **24** → col Y |
| L | Province | MC | index **25** → col Z |
| M | Hire Date | MC | index **28** → col AC |
| N | Email Address | MC | index **35** → col AJ |
| O | DS NIP | MC | index **20** → col U |
| P | DS Name | MC | index **21** → col V |
| Q | DS Position | MC | index **18** → col S (*Parent Position Name*) |
| R | Completion Status Mandatory LOG+ 2026 | Formula | `=IF(S2=100%,"Completed","Incompleted")` |
| S | % Completion Mandatory LOG+ 2026 | LOG+ | `=VLOOKUP(B2,'LOG+'!$B$3:$AF$...,8,FALSE)` |
| T | Completion Status Mandatory VR Learning 2026 | VR | `=VLOOKUP(B2,'VR Learning'!$A$1:$K$...,10,FALSE)` |
| U | % Completion Mandatory VR Learning 2026 | VR | `=VLOOKUP(B2,'VR Learning'!$A$1:$K$...,11,FALSE)` |
| V | Completion Status | Formula | `=IF(W2=100%,"Completed","Incompleted")` |
| W | % Completion | Formula | `=(S2+U2)/2` |

> **Catatan:** Ganti `'MC Jul 26'` dengan nama sheet dinamis dari A1 referensi aktif.

---

## 6. Sheet Summary All

### Layout acuan

| Baris | Isi |
|---|---|
| 3 | Judul: `Mandatory LOG+ & VR Learning 2026` |
| 4 | Sub-judul: LOG+ / VR / Combined |
| 5 | Header: `Dir/Subdir`, `# Employee`, `Completed`, `Incompleted`, `Completion Rate`, … |
| 6+ | Data per directorate |

### Kolom summary (per directorate)

| Col | Header | Keterangan |
|---|---|---|
| B | Dir/Subdir | Nama directorate |
| C | # Employee | Total karyawan |
| D | LOG+ Completed | |
| E | LOG+ Incompleted | |
| F | LOG+ Completion Rate | |
| G | VR Completed | |
| H | VR Incompleted | |
| I | VR Completion Rate | |
| J | Combined Completed | |
| K | Combined Incompleted | |
| L | Combined Completion Rate | |
| M | Resign/MPP/Others | Belum dihitung; sumber data status belum tersedia |

> **Catatan:** nilai `Resign/MPP/Others` sementara diisi `0`. Perhitungan akan
> ditambahkan setelah sumber data dan aturan status tersedia.

### Formula acuan (contoh baris 7 — Business Banking)

File acuan memakai **GETPIVOTDATA** dari pivot table embedded:

```excel
C7 = GETPIVOTDATA("NIP",$B$26,"Directorate","Apprentice") - M7
D7 = GETPIVOTDATA("NIP",$E$27,"Directorate","Apprentice")
E7 = C7 - D7          // Incompleted (LOG+)
F7 = D7 / C7          // Completion Rate (LOG+)
...
```

**Implementasi sistem — 2 opsi:**

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| **A. Replicate pivot** (ExcelJS + pivot cache) | 100% match file acuan | Kompleks, sulit di-maintain |
| **B. Hitung di backend, tulis nilai + formula sederhana** | Lebih stabil | Pivot tidak native di file |

**Rekomendasi fase 1:** Opsi B — hitung agregat directorate dari `Mandatory 2026` (col R, S, T, U, V, W), tulis ke Summary All dengan formula rate `=IF(C=0,0,D/C)` style.

---

## 7. Alur Data End-to-End

```text
┌─────────────────────┐     ┌──────────────────────┐
│ reference_file.xlsx │     │ Upload LOG+ / VR      │
│ (MC master)         │     │ (completion files)  │
└─────────┬───────────┘     └──────────┬───────────┘
          │                            │
          ▼                            ▼
   Derive sheet name              Parse & store
   "MC Jul 26" from A1            (wide LOG+, flat VR)
          │                            │
          └──────────┬─────────────────┘
                     ▼
           Generate Mandatory 2026
           (NIP list + VLOOKUP formulas)
                     │
                     ▼
           Generate Summary All
           (aggregate by directorate)
                     │
                     ▼
        LOG_VR_completion_<yyyymmdd>.xlsx
```

---

## 8. Gap vs Implementasi Saat Ini

| Area | Saat ini | Target |
|---|---|---|
| Export filename | `CMND_Analytics_<date>.xlsx` | `LOG_VR_completion_<yyyymmdd>.xlsx` |
| Sheet referensi MC | Tidak ada | Copy dari `reference_file.xlsx`, nama dinamis |
| LOG+ export | Flat rows dari DB (max 5000) | Wide matrix 3-baris header |
| VR export | Flat, header 1 baris | Header 2 baris sesuai acuan |
| Mandatory 2026 | 9 kolom, data dari DB processed | 23 kolom, VLOOKUP ke MC + LOG+ + VR |
| Summary All | Flat table sederhana | Layout + formula/pivot style acuan |
| Upload LOG+ parser | 1 baris per modul (~240k) | Harus preserve overall COMPLETION (col I) |
| Referensi upload | Belum ada | Admin upload replace file + update sheet name |

---

## 9. Rencana Implementasi (Fase)

### Fase 1 — Foundation
- [ ] Service `deriveMcSheetName(a1Title)` → `"MC Jul 26"`
- [ ] Simpan referensi aktif di backend (`backend/data/`)
- [ ] API upload referensi (admin) + metadata sheet name
- [ ] Export filename `LOG_VR_completion_<yyyymmdd>.xlsx`

### Fase 2 — Sheet generation
- [ ] Export sheet MC (copy referensi, rename sheet)
- [ ] Export LOG+ wide format (dari snapshot upload atau rebuild)
- [ ] Export VR Learning format 2-header
- [ ] Export Mandatory 2026 dengan formula VLOOKUP lengkap

### Fase 3 — Summary & polish
- [ ] Summary All layout + agregasi directorate
- [ ] Conditional formatting (hijau/merah Completed/Incompleted)
- [ ] Validasi: buka file di Excel, formula tidak `#N/A`

### Fase 4 — Upload pipeline fix
- [ ] Parser LOG+: simpan overall completion per karyawan (col I)
- [ ] Optional: simpan raw wide file untuk export exact replay

---

## 10. File Acuan di Repo

| File | Path |
|---|---|
| Workbook acuan lengkap | `backend/samples/mandatory_reference.xlsx` |
| Referensi MC default | `frontend/public/reference_file.xlsx` |
| Sample upload LOG+ (simple) | `backend/samples/sample_log_plus.xlsx` |
| Sample upload VR (simple) | `backend/samples/sample_vr_learning.xlsx` |
| File user (wide LOG+) | `~/Downloads/log.xlsx` |
| File user (VR) | `~/Downloads/vr.xlsx` |

---

## 11. Keputusan yang Perlu Konfirmasi

Sebelum coding, konfirmasi hal berikut:

1. **Daftar NIP Mandatory 2026** — pakai semua NIP di referensi MC, atau union LOG+/VR saja, atau list kurasi?
2. **LOG+ export** — replay file upload asli (exact), atau rebuild wide dari DB?
3. **Summary All** — perlu pivot native Excel, atau cukup formula/hitung backend?
4. **Upload referensi** — hanya admin, simpan di server (bukan `frontend/public`)?

---

*Dibuat dari analisa file `Mandatory LOG_VR Learning.xlsx` dan `reference_file.xlsx` — Aug 2026.*
