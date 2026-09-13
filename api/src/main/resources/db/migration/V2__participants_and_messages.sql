-- Lista uczestniczek wyjazdu i wiadomości do nich.

create table participants (
    id             uuid primary key,
    created_at     timestamp with time zone not null,
    updated_at     timestamp with time zone not null,
    version        bigint      not null default 0,
    trip_id        uuid        not null references trips (id) on delete cascade,
    order_id       uuid        not null references orders (id) on delete cascade,
    order_item_id  uuid        not null references order_items (id) on delete cascade,
    seat_number    integer     not null,
    first_name     varchar(120),
    last_name      varchar(120),
    email          varchar(320),
    phone          varchar(40),
    note           varchar(2000),
    contact_person boolean     not null default false,
    status         varchar(20) not null,
    constraint uk_participants_seat unique (order_item_id, seat_number),
    constraint ck_participants_seat check (seat_number > 0)
);

create index ix_participants_trip on participants (trip_id, status);
create index ix_participants_order on participants (order_id);

create table trip_messages (
    id              uuid primary key,
    created_at      timestamp with time zone not null,
    updated_at      timestamp with time zone not null,
    version         bigint        not null default 0,
    trip_id         uuid          not null references trips (id) on delete cascade,
    subject         varchar(200)  not null,
    body            varchar(10000) not null,
    audience        varchar(30)   not null,
    sent_by         varchar(320)  not null,
    sent_at         timestamp with time zone not null,
    recipient_count integer       not null default 0,
    failed_count    integer       not null default 0,
    provider        varchar(40)   not null
);

create index ix_trip_messages_trip on trip_messages (trip_id, sent_at);

create table message_deliveries (
    id              uuid primary key,
    created_at      timestamp with time zone not null,
    updated_at      timestamp with time zone not null,
    version         bigint       not null default 0,
    message_id      uuid         not null references trip_messages (id) on delete cascade,
    recipient_name  varchar(240),
    recipient_email varchar(320) not null,
    status          varchar(20)  not null,
    failure_reason  varchar(500)
);

create index ix_message_deliveries_message on message_deliveries (message_id);
