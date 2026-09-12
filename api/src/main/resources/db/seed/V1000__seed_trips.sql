-- Dane startowe wyjazdów (środowisko lokalne / demo).
-- Plik generowany z src/lib/data/trips.ts — patrz api/README.md.

-- Tajlandia & Bali
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', current_timestamp, current_timestamp, 0, 'tajlandia-bali', 'Tajlandia & Bali', 'Trzy raje, jedna czuła podróż.',
        'ASIA', 'Tajlandia / Indonezja', 15,
        date '2026-10-04', date '2026-10-18', 14900, 2000,
        10, 6, true, 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 0, 'Warsztaty psychologiczne i seksuologiczne prowadzone przez Wikę i Natkę');
insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 1, 'Wszystkie noclegi w starannie wybranych miejscach');
insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 2, 'Codzienne zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 4, 'Lokalne wycieczki i atrakcje z agendy');
insert into trip_included (trip_id, position_index, item) values ('aa8a7ff1-1ac4-474b-9179-daab0937399c', 5, 'Opieka i koordynacja organizatorek 24/7');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('c6e4ba27-9623-4a8a-b7b6-a478d6782dcc', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 0, 'Koh Samui', 'Dni 1–5', 'Miękkie wejście w podróż — plaża, oddech, pierwsze warsztaty i poznanie grupy.', 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('964a73ef-f321-444b-ae31-7a25e8e0b721', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 1, 'Krabi', 'Dni 6–10', 'Wapienne klify, długie łodzie i głębsza praca warsztatowa w sercu Andamanów.', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('21cf7c82-3df9-4285-bfb1-9580e3693bc5', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 2, 'Bali', 'Dni 11–15', 'Zielone tarasy ryżowe, joga o świcie i domknięcie wspólnej historii.', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('953a8921-089f-44be-a4c3-bfebd6633439', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 1, 'Powitanie na Koh Samui', 'Transfer z lotniska, zakwaterowanie, wieczór zapoznawczy i rozdanie gift bagów.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('953a8921-089f-44be-a4c3-bfebd6633439', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('953a8921-089f-44be-a4c3-bfebd6633439', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('dc60fd83-6e02-46e7-a145-49ef7fa8cb1b', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa: bezpieczna przestrzeń, kontrakt grupowy, intencje na podróż.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('dc60fd83-6e02-46e7-a145-49ef7fa8cb1b', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('9400ad83-dd16-4036-919b-6d7fa02f67d7', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 3, 'Poranna joga & plaża', 'Fitness o wschodzie słońca, dzień regeneracji nad wodą, wieczorny krąg dzielenia.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9400ad83-dd16-4036-919b-6d7fa02f67d7', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9400ad83-dd16-4036-919b-6d7fa02f67d7', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('aed3cd1f-54a9-464d-81b1-834c8b45111b', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 4, 'Bliżej siebie', 'Warsztat z obszaru psychoseksuologii — praca z ciałem, wstydem i granicami.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('aed3cd1f-54a9-464d-81b1-834c8b45111b', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('4befae5d-0072-42d0-b69f-60f2954493f5', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 5, 'Lokalna kultura', 'Wycieczka po wyspie, lokalna kuchnia, targ i świątynie. Kolacja pożegnalna z Samui.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('4befae5d-0072-42d0-b69f-60f2954493f5', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('4befae5d-0072-42d0-b69f-60f2954493f5', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('be1c6694-356d-46f6-b280-4085122e07de', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 6, 'Przelot do Krabi', 'Zmiana scenerii: wapienne klify, dżungla i nowy dom na kolejne pięć dni.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('be1c6694-356d-46f6-b280-4085122e07de', 0, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('c60e5363-7d4d-4255-ae5a-87ea9038c27d', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 7, 'Wyspy Phi Phi', 'Rejs long-tail boatem, snorkeling i laguny, o których marzyłaś oglądając zdjęcia.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('c60e5363-7d4d-4255-ae5a-87ea9038c27d', 0, 'wycieczka');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('6b18ae4e-52b4-4a14-9732-2cb6e61161de', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 8, 'Wysoka wrażliwość', 'Warsztat o układzie nerwowym, przebodźcowaniu i czułości wobec siebie.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('6b18ae4e-52b4-4a14-9732-2cb6e61161de', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('81c43599-3a1a-4d8f-9c56-7f351b208af5', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 9, 'Ruch i woda', 'Trening funkcjonalny nad zatoką, popołudnie w gorących źródłach, masaż tajski.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('81c43599-3a1a-4d8f-9c56-7f351b208af5', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('81c43599-3a1a-4d8f-9c56-7f351b208af5', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('78cc0083-52f2-40d6-9390-c659d62b11c3', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 10, 'Dzień dla siebie', 'Bez agendy. Możesz spać, czytać, płynąć albo nie robić absolutnie nic.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('78cc0083-52f2-40d6-9390-c659d62b11c3', 0, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('24d0dfda-1dda-4c7d-ba29-f5da76a1315d', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 11, 'Witaj, Bali', 'Przelot na Bali, zakwaterowanie wśród tarasów ryżowych, kolacja powitalna.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('24d0dfda-1dda-4c7d-ba29-f5da76a1315d', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('24d0dfda-1dda-4c7d-ba29-f5da76a1315d', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('9bf78410-ab82-493e-b72d-5ad81f3528d3', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 12, 'Bliskość i granice', 'Przedostatni warsztat — o relacjach, komunikowaniu potrzeb i mówieniu „nie”.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9bf78410-ab82-493e-b72d-5ad81f3528d3', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('4fd9c183-7c67-4216-a812-1d246247d8e0', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 13, 'Ubud i tarasy ryżowe', 'Wycieczka do Ubud, świątynia nad wodą, warsztat lokalnej kuchni.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('4fd9c183-7c67-4216-a812-1d246247d8e0', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('4fd9c183-7c67-4216-a812-1d246247d8e0', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('9509a932-fca3-4229-8f7e-5377d9394177', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 14, 'Domknięcie', 'Warsztat zamknięcia, sesja zdjęciowa o zachodzie słońca i uroczysta kolacja.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9509a932-fca3-4229-8f7e-5377d9394177', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9509a932-fca3-4229-8f7e-5377d9394177', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('2bd54bde-eb8d-41c6-9e4b-53ac237a20ca', current_timestamp, current_timestamp, 0, 'aa8a7ff1-1ac4-474b-9179-daab0937399c', 15, 'Powrót', 'Ostatnia wspólna joga, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('2bd54bde-eb8d-41c6-9e4b-53ac237a20ca', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('2bd54bde-eb8d-41c6-9e4b-53ac237a20ca', 1, 'relaks');

-- Zanzibar
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', current_timestamp, current_timestamp, 0, 'zanzibar', 'Zanzibar', 'Ocean, przyprawy i powrót do siebie.',
        'AFRICA', 'Tanzania', 8,
        date '2027-02-07', date '2027-02-14', 9900, 1500,
        10, 2, true, 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 0, 'Warsztaty psychologiczne i seksuologiczne');
insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 1, 'Noclegi przy plaży');
insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 2, 'Codzienne zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 4, 'Lokalne wycieczki');
insert into trip_included (trip_id, position_index, item) values ('5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 5, 'Opieka organizatorek');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('c01645ab-69cf-45d0-9e9f-f4a0e4d0de25', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 0, 'Nungwi', 'Dni 1–4', 'Turkusowa woda, rajskie plaże i warsztaty u progu oceanu.', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('b20af85c-bce9-4deb-abdd-44b6e69b1836', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 1, 'Stone Town', 'Dni 5–8', 'Wyspa przypraw, historia i domknięcie podróży.', 'https://images.unsplash.com/photo-1568736333610-eae6e0ab9206?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('0bc630cb-39be-4ff6-bb9f-972700fdee9a', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 1, 'Powitanie w Nungwi', 'Transfer, zakwaterowanie tuż przy plaży i wieczór zapoznawczy przy ognisku.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('0bc630cb-39be-4ff6-bb9f-972700fdee9a', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('0bc630cb-39be-4ff6-bb9f-972700fdee9a', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('b2935fb4-ebf9-47eb-aca8-427b0c846ae8', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa nad oceanem — intencje, kontrakt, bezpieczna przestrzeń.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('b2935fb4-ebf9-47eb-aca8-427b0c846ae8', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('816251e7-a493-4749-b045-3dbe53f6d4e8', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 3, 'Fitness & laguna', 'Poranny trening na piasku, popołudnie na wodzie, zachód słońca z dhow.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('816251e7-a493-4749-b045-3dbe53f6d4e8', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('816251e7-a493-4749-b045-3dbe53f6d4e8', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('b8022789-fca4-4069-a9a6-88ac6b562b10', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 4, 'Kobieca energia i ciało', 'Warsztat o cykliczności, akceptacji ciała i czułości wobec siebie.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('b8022789-fca4-4069-a9a6-88ac6b562b10', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('22a62540-e656-4099-adb9-2bcf0c0a3afd', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 5, 'Wyspa przypraw', 'Spice tour, lokalny lunch i przejazd do Stone Town — zupełnie inny Zanzibar.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('22a62540-e656-4099-adb9-2bcf0c0a3afd', 0, 'wycieczka');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('22a62540-e656-4099-adb9-2bcf0c0a3afd', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('1cc1f54b-ac09-44ca-8e13-325ac66503ed', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 6, 'Wypalenie i odpoczynek', 'Warsztat o regeneracji układu nerwowego — i praktyka odpoczynku w wersji dosłownej.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('1cc1f54b-ac09-44ca-8e13-325ac66503ed', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('1cc1f54b-ac09-44ca-8e13-325ac66503ed', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('35089995-c672-4334-82de-ff04cfb1b70b', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 7, 'Domknięcie', 'Sesja zamknięcia, sesja zdjęciowa w uliczkach Stone Town, uroczysta kolacja.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('35089995-c672-4334-82de-ff04cfb1b70b', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('35089995-c672-4334-82de-ff04cfb1b70b', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('9b25ddd4-f30d-4cfa-8c0c-393f39716068', current_timestamp, current_timestamp, 0, '5b80578a-4462-4e86-9ea6-8198f1ab6ed2', 8, 'Powrót', 'Poranna joga, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9b25ddd4-f30d-4cfa-8c0c-393f39716068', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('9b25ddd4-f30d-4cfa-8c0c-393f39716068', 1, 'relaks');

-- Portugalia
insert into trips (id, created_at, updated_at, version, slug, title, tagline, continent, country,
                   duration_days, start_date, end_date, price, deposit, capacity, booked_seats,
                   published, cover_image)
values ('14c6dac8-a882-4c49-912e-056e300449e3', current_timestamp, current_timestamp, 0, 'portugalia', 'Portugalia', 'Atlantyk, światło i czas dla siebie.',
        'EUROPE', 'Portugalia', 6,
        date '2026-09-12', date '2026-09-17', 6900, 1200,
        10, 10, true, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600&auto=format&fit=crop');

insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 0, 'Warsztaty psychologiczne i seksuologiczne');
insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 1, 'Noclegi w butikowych miejscach');
insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 2, 'Zajęcia fitness / joga');
insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 3, 'Gift bag powitalny');
insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 4, 'Lokalne wycieczki');
insert into trip_included (trip_id, position_index, item) values ('14c6dac8-a882-4c49-912e-056e300449e3', 5, 'Opieka organizatorek');

insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('750aed59-d4c6-4e2a-8a16-c4770bb773a6', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 0, 'Lizbona', 'Dni 1–3', 'Kolorowe uliczki, światło i pierwsze warsztaty.', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1200&auto=format&fit=crop');
insert into trip_destinations (id, created_at, updated_at, version, trip_id, position_index, name, day_range, description, image)
values ('04945fae-af97-4135-8ab2-3ad1c46e114d', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 1, 'Algarve', 'Dni 4–6', 'Klify nad Atlantykiem i domknięcie podróży.', 'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200&auto=format&fit=crop');

insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('24720a8c-b276-4f28-bebd-9f99b2a45965', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 1, 'Powitanie w Lizbonie', 'Transfer, zakwaterowanie w butikowym hotelu i kolacja powitalna z widokiem na Tag.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('24720a8c-b276-4f28-bebd-9f99b2a45965', 0, 'relaks');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('24720a8c-b276-4f28-bebd-9f99b2a45965', 1, 'integracja');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('0d28858d-8b45-4112-9808-a88173687c90', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 2, 'Warsztat otwarcia', 'Pierwsza sesja warsztatowa, a po niej spacer po Alfamie i wieczór z fado.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('0d28858d-8b45-4112-9808-a88173687c90', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('0d28858d-8b45-4112-9808-a88173687c90', 1, 'kultura');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('94429767-f35c-4d1c-bdb0-3fcc2d48ddce', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 3, 'Sintra i ocean', 'Wycieczka do Sintry, pałace jak z bajki i pierwszy kontakt z Atlantykiem.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('94429767-f35c-4d1c-bdb0-3fcc2d48ddce', 0, 'wycieczka');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('8b5eb703-a2e4-418f-881b-c882c1216b04', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 4, 'Przejazd na Algarve', 'Klify, groty i nowy dom na ostatnie dni. Popołudniowa joga nad oceanem.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('8b5eb703-a2e4-418f-881b-c882c1216b04', 0, 'fitness');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('8b5eb703-a2e4-418f-881b-c882c1216b04', 1, 'relaks');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('505b793c-69da-4fb9-8cfe-95bded57ffd4', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 5, 'Neuroróżnorodność w codzienności', 'Warsztat o organizowaniu życia, odpoczynku i bliskości w zgodzie ze sobą.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('505b793c-69da-4fb9-8cfe-95bded57ffd4', 0, 'warsztat');
insert into trip_days (id, created_at, updated_at, version, trip_id, day_number, title, description)
values ('a157c515-bd24-4efd-9849-962903a994f5', current_timestamp, current_timestamp, 0, '14c6dac8-a882-4c49-912e-056e300449e3', 6, 'Domknięcie i powrót', 'Krąg zamknięcia o wschodzie słońca, śniadanie bez pośpiechu i transfer na lotnisko.');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('a157c515-bd24-4efd-9849-962903a994f5', 0, 'warsztat');
insert into trip_day_tags (trip_day_id, position_index, tag) values ('a157c515-bd24-4efd-9849-962903a994f5', 1, 'integracja');

