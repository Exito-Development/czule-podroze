-- Dane startowe wyjazdów (środowisko lokalne / demo).
-- Plik generowany z src/lib/data/trips.ts — patrz api/README.md.
-- Wgrywa go changeset `seed-trips` z db/changelog/900-seed-trips.yaml.

-- Tajlandia & Bali
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('f504d67a-5f94-5da8-9eca-3942952d62e3', current_timestamp, current_timestamp, 0, 'tajlandia-bali', 'Tajlandia & Bali', 'Trzy raje, jedna czuła podróż.',
        'ASIA', 'Tajlandia / Indonezja', 15,
        date '2026-10-04', date '2026-10-18', 14900, 2000,
        10, 6, true, 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 0, 'Warsztaty psychologiczne i seksuologiczne prowadzone przez Wikę i Natkę');
insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 1, 'Wszystkie noclegi w starannie wybranych miejscach');
insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 2, 'Codzienne zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 4, 'Lokalne wycieczki i atrakcje z agendy');
insert into trip_included (trip_id, position_index, item) values ('f504d67a-5f94-5da8-9eca-3942952d62e3', 5, 'Opieka i koordynacja organizatorek 24/7');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('8c3ab0db-9e7f-5fce-a6a3-5c62d10c5870', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 0, 'Koh Samui', 'Dni 1–5', 'Miękkie wejście w podróż — plaża, oddech, pierwsze warsztaty i poznanie grupy.', 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('0e2b626f-7398-5446-8fa0-8c2722f634ea', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 1, 'Krabi', 'Dni 6–10', 'Wapienne klify, długie łodzie i głębsza praca warsztatowa w sercu Andamanów.', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('f1491a33-65fb-5900-a503-10834bca4b0b', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 2, 'Bali', 'Dni 11–15', 'Zielone tarasy ryżowe, joga o świcie i domknięcie wspólnej historii.', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('ba5e2f8a-f598-566e-a96a-0ec65adec5f2', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 1, 'Powitanie na Koh Samui', 'Transfer z lotniska, zakwaterowanie, wieczór zapoznawczy i rozdanie gift bagów.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ba5e2f8a-f598-566e-a96a-0ec65adec5f2', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ba5e2f8a-f598-566e-a96a-0ec65adec5f2', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('9245dc4a-4bb5-5f84-b795-5f74bf49f9c5', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa: bezpieczna przestrzeń, kontrakt grupowy, intencje na podróż.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9245dc4a-4bb5-5f84-b795-5f74bf49f9c5', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('39fdd917-fe42-5b4d-9068-ac54e6982176', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 3, 'Poranna joga & plaża', 'Fitness o wschodzie słońca, dzień regeneracji nad wodą, wieczorny krąg dzielenia.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('39fdd917-fe42-5b4d-9068-ac54e6982176', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('39fdd917-fe42-5b4d-9068-ac54e6982176', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('aef794b3-3451-538a-9ba0-a822507f8e3a', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 4, 'Bliżej siebie', 'Warsztat z obszaru psychoseksuologii — praca z ciałem, wstydem i granicami.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('aef794b3-3451-538a-9ba0-a822507f8e3a', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('5eada2fb-229f-5a19-b487-38c44f6e71fc', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 5, 'Lokalna kultura', 'Wycieczka po wyspie, lokalna kuchnia, targ i świątynie. Kolacja pożegnalna z Samui.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('5eada2fb-229f-5a19-b487-38c44f6e71fc', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('5eada2fb-229f-5a19-b487-38c44f6e71fc', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('0d2bd9cc-19c1-5037-baa7-559592adc254', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 6, 'Przelot do Krabi', 'Zmiana scenerii: wapienne klify, dżungla i nowy dom na kolejne pięć dni.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('0d2bd9cc-19c1-5037-baa7-559592adc254', 0, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('e88dfcc7-ceb4-5a17-a006-6da66495fb74', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 7, 'Wyspy Phi Phi', 'Rejs long-tail boatem, snorkeling i laguny, o których marzyłaś oglądając zdjęcia.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('e88dfcc7-ceb4-5a17-a006-6da66495fb74', 0, 'wycieczka');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('3fd48c7d-9800-5fc9-9d82-628e34428755', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 8, 'Wysoka wrażliwość', 'Warsztat o układzie nerwowym, przebodźcowaniu i czułości wobec siebie.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('3fd48c7d-9800-5fc9-9d82-628e34428755', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('b74ba824-f323-533f-a715-64d5b1dc89d0', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 9, 'Ruch i woda', 'Trening funkcjonalny nad zatoką, popołudnie w gorących źródłach, masaż tajski.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('b74ba824-f323-533f-a715-64d5b1dc89d0', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('b74ba824-f323-533f-a715-64d5b1dc89d0', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('37842663-6bab-521c-829a-f319b7c92ba3', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 10, 'Dzień dla siebie', 'Bez agendy. Możesz spać, czytać, płynąć albo nie robić absolutnie nic.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('37842663-6bab-521c-829a-f319b7c92ba3', 0, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('750e3537-a16d-5d0c-b182-63047811bfb4', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 11, 'Witaj, Bali', 'Przelot na Bali, zakwaterowanie wśród tarasów ryżowych, kolacja powitalna.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('750e3537-a16d-5d0c-b182-63047811bfb4', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('750e3537-a16d-5d0c-b182-63047811bfb4', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('977eb9cb-db55-584c-9704-c6943bfb1ef9', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 12, 'Bliskość i granice', 'Przedostatni warsztat — o relacjach, komunikowaniu potrzeb i mówieniu „nie”.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('977eb9cb-db55-584c-9704-c6943bfb1ef9', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('c74e6664-fd12-5fe5-9782-1856239b1d49', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 13, 'Ubud i tarasy ryżowe', 'Wycieczka do Ubud, świątynia nad wodą, warsztat lokalnej kuchni.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('c74e6664-fd12-5fe5-9782-1856239b1d49', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('c74e6664-fd12-5fe5-9782-1856239b1d49', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('871941e1-3749-579e-8e41-fc80be3c5545', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 14, 'Domknięcie', 'Warsztat zamknięcia, sesja zdjęciowa o zachodzie słońca i uroczysta kolacja.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('871941e1-3749-579e-8e41-fc80be3c5545', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('871941e1-3749-579e-8e41-fc80be3c5545', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('ce2c3817-7011-5a24-9372-d12a4ae55fd3', current_timestamp, current_timestamp, 0, 'f504d67a-5f94-5da8-9eca-3942952d62e3', 15, 'Powrót', 'Ostatnia wspólna joga, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ce2c3817-7011-5a24-9372-d12a4ae55fd3', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ce2c3817-7011-5a24-9372-d12a4ae55fd3', 1, 'relaks');

-- Zanzibar
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', current_timestamp, current_timestamp, 0, 'zanzibar', 'Zanzibar', 'Ocean, przyprawy i powrót do siebie.',
        'AFRICA', 'Tanzania', 8,
        date '2027-02-07', date '2027-02-14', 9900, 1500,
        10, 2, true, 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 0, 'Warsztaty psychologiczne i seksuologiczne');
insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 1, 'Noclegi przy plaży');
insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 2, 'Codzienne zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 4, 'Lokalne wycieczki');
insert into trip_included (trip_id, position_index, item) values ('5a36b12b-c855-5b52-b964-e10f4fb82f4b', 5, 'Opieka organizatorek');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('b87fa767-02ea-5de6-b726-75cb41355291', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 0, 'Nungwi', 'Dni 1–4', 'Turkusowa woda, rajskie plaże i warsztaty u progu oceanu.', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('c28f07f1-1834-5fd8-9a11-2658a3e89f9a', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 1, 'Stone Town', 'Dni 5–8', 'Wyspa przypraw, historia i domknięcie podróży.', 'https://images.unsplash.com/photo-1568736333610-eae6e0ab9206?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('df21df34-501f-52e8-aba8-478dfbcfa5cc', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 1, 'Powitanie w Nungwi', 'Transfer, zakwaterowanie tuż przy plaży i wieczór zapoznawczy przy ognisku.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('df21df34-501f-52e8-aba8-478dfbcfa5cc', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('df21df34-501f-52e8-aba8-478dfbcfa5cc', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('80195c07-5940-5d94-afce-d052eee1e936', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa nad oceanem — intencje, kontrakt, bezpieczna przestrzeń.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('80195c07-5940-5d94-afce-d052eee1e936', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('ddec5d3a-8c55-54a5-8129-9fd3ffc03129', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 3, 'Fitness & laguna', 'Poranny trening na piasku, popołudnie na wodzie, zachód słońca z dhow.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ddec5d3a-8c55-54a5-8129-9fd3ffc03129', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('ddec5d3a-8c55-54a5-8129-9fd3ffc03129', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('2723de85-f075-546c-91b7-51750153fa13', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 4, 'Kobieca energia i ciało', 'Warsztat o cykliczności, akceptacji ciała i czułości wobec siebie.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('2723de85-f075-546c-91b7-51750153fa13', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('50e8c8da-bb3d-5525-8101-efc9fdfcc07c', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 5, 'Wyspa przypraw', 'Spice tour, lokalny lunch i przejazd do Stone Town — zupełnie inny Zanzibar.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('50e8c8da-bb3d-5525-8101-efc9fdfcc07c', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('50e8c8da-bb3d-5525-8101-efc9fdfcc07c', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('18932684-8124-5b50-988a-89cb2d92a100', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 6, 'Wypalenie i odpoczynek', 'Warsztat o regeneracji układu nerwowego — i praktyka odpoczynku w wersji dosłownej.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('18932684-8124-5b50-988a-89cb2d92a100', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('18932684-8124-5b50-988a-89cb2d92a100', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('438a8f59-680c-5f45-943c-fa7aa6831d5f', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 7, 'Domknięcie', 'Sesja zamknięcia, sesja zdjęciowa w uliczkach Stone Town, uroczysta kolacja.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('438a8f59-680c-5f45-943c-fa7aa6831d5f', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('438a8f59-680c-5f45-943c-fa7aa6831d5f', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('e1168397-ad05-5709-9926-91228e7fb726', current_timestamp, current_timestamp, 0, '5a36b12b-c855-5b52-b964-e10f4fb82f4b', 8, 'Powrót', 'Poranna joga, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('e1168397-ad05-5709-9926-91228e7fb726', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('e1168397-ad05-5709-9926-91228e7fb726', 1, 'relaks');

-- Portugalia
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', current_timestamp, current_timestamp, 0, 'portugalia', 'Portugalia', 'Atlantyk, światło i czas dla siebie.',
        'EUROPE', 'Portugalia', 6,
        date '2026-09-12', date '2026-09-17', 6900, 1200,
        10, 10, true, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 0, 'Warsztaty psychologiczne i seksuologiczne');
insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 1, 'Noclegi w butikowych miejscach');
insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 2, 'Zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 4, 'Lokalne wycieczki');
insert into trip_included (trip_id, position_index, item) values ('f4f8cb87-45d8-5365-80c0-a44713fa67d7', 5, 'Opieka organizatorek');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('02b5f374-ade6-5be7-a262-2fea5a392e36', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 0, 'Lizbona', 'Dni 1–3', 'Kolorowe uliczki, światło i pierwsze warsztaty.', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('928d8bef-92af-51b7-b8d9-8356bc9de826', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 1, 'Algarve', 'Dni 4–6', 'Klify nad Atlantykiem i domknięcie podróży.', 'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('15fcee01-603e-5dd7-be83-98b19abd1c54', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 1, 'Powitanie w Lizbonie', 'Transfer, zakwaterowanie w butikowym hotelu i kolacja powitalna z widokiem na Tag.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('15fcee01-603e-5dd7-be83-98b19abd1c54', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('15fcee01-603e-5dd7-be83-98b19abd1c54', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('cd81e787-1dc4-5821-a399-85a146160e90', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa, a po niej spacer po Alfamie i wieczór z fado.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('cd81e787-1dc4-5821-a399-85a146160e90', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('cd81e787-1dc4-5821-a399-85a146160e90', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('090192af-5e33-5c12-8567-cea97f8809ef', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 3, 'Sintra i ocean', 'Wycieczka do Sintry, pałace jak z bajki i pierwszy kontakt z Atlantykiem.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('090192af-5e33-5c12-8567-cea97f8809ef', 0, 'wycieczka');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('96709d4a-1675-50dc-b594-bcd7c44fbed5', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 4, 'Przejazd na Algarve', 'Klify, groty i nowy dom na ostatnie dni. Popołudniowa joga nad oceanem.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('96709d4a-1675-50dc-b594-bcd7c44fbed5', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('96709d4a-1675-50dc-b594-bcd7c44fbed5', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('967e11d9-f70f-5a96-ae96-2a54d9f3e709', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 5, 'Neuroróżnorodność w codzienności', 'Warsztat o organizowaniu życia, odpoczynku i bliskości w zgodzie ze sobą.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('967e11d9-f70f-5a96-ae96-2a54d9f3e709', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('c0462ce9-b25e-521d-85fc-bafb99ebe170', current_timestamp, current_timestamp, 0, 'f4f8cb87-45d8-5365-80c0-a44713fa67d7', 6, 'Domknięcie i powrót', 'Krąg zamknięcia o wschodzie słońca, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('c0462ce9-b25e-521d-85fc-bafb99ebe170', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('c0462ce9-b25e-521d-85fc-bafb99ebe170', 1, 'integracja');

