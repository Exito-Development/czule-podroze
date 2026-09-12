-- Czuła Podróż — schemat początkowy.
-- Składnia celowo „wspólna" dla PostgreSQL (produkcja) i H2 (lokalnie/testy).

create table trips (
    id              uuid primary key,
    created_at      timestamp with time zone not null,
    updated_at      timestamp with time zone not null,
    version         bigint       not null default 0,
    slug            varchar(120) not null unique,
    title           varchar(160) not null,
    tagline         varchar(300) not null,
    continent       varchar(20)  not null,
    country         varchar(120) not null,
    duration_days   integer      not null,
    start_date      date         not null,
    end_date        date         not null,
    price           numeric(12, 2) not null,
    deposit         numeric(12, 2) not null,
    capacity        integer      not null,
    booked_seats    integer      not null default 0,
    published       boolean      not null default true,
    cover_image     varchar(500) not null,
    constraint ck_trips_capacity check (capacity >= 0),
    constraint ck_trips_booked check (booked_seats >= 0 and booked_seats <= capacity)
);

create table trip_included (
    trip_id        uuid         not null references trips (id) on delete cascade,
    position_index integer      not null,
    item           varchar(300) not null,
    primary key (trip_id, position_index)
);

create table trip_days (
    id          uuid primary key,
    created_at  timestamp with time zone not null,
    updated_at  timestamp with time zone not null,
    version     bigint        not null default 0,
    trip_id     uuid          not null references trips (id) on delete cascade,
    day_number  integer       not null,
    title       varchar(160)  not null,
    description varchar(2000) not null,
    constraint uk_trip_days_number unique (trip_id, day_number)
);

create table trip_day_tags (
    trip_day_id    uuid        not null references trip_days (id) on delete cascade,
    position_index integer     not null,
    tag            varchar(40) not null,
    primary key (trip_day_id, position_index)
);

create table trip_destinations (
    id             uuid primary key,
    created_at     timestamp with time zone not null,
    updated_at     timestamp with time zone not null,
    version        bigint        not null default 0,
    trip_id        uuid          not null references trips (id) on delete cascade,
    position_index integer       not null,
    name           varchar(120)  not null,
    day_range      varchar(60)   not null,
    description    varchar(1000) not null,
    image          varchar(500)  not null
);

create index ix_trip_destinations_trip on trip_destinations (trip_id);

create table user_accounts (
    id            uuid primary key,
    created_at    timestamp with time zone not null,
    updated_at    timestamp with time zone not null,
    version       bigint       not null default 0,
    email         varchar(320) not null unique,
    password_hash varchar(200) not null,
    first_name    varchar(120),
    last_name     varchar(120),
    role          varchar(20)  not null,
    enabled       boolean      not null default true
);

create table refresh_tokens (
    id         uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    version    bigint      not null default 0,
    user_id    uuid        not null references user_accounts (id) on delete cascade,
    token_hash varchar(64) not null unique,
    family_id  uuid        not null,
    expires_at timestamp with time zone not null,
    revoked_at timestamp with time zone
);

create index ix_refresh_tokens_user on refresh_tokens (user_id);
create index ix_refresh_tokens_family on refresh_tokens (family_id);

create table carts (
    id         uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    version    bigint      not null default 0,
    status     varchar(20) not null,
    user_id    uuid
);

create index ix_carts_user on carts (user_id);

create table cart_items (
    id           uuid primary key,
    created_at   timestamp with time zone not null,
    updated_at   timestamp with time zone not null,
    version      bigint      not null default 0,
    cart_id      uuid        not null references carts (id) on delete cascade,
    trip_id      uuid        not null references trips (id),
    seats        integer     not null,
    payment_mode varchar(20) not null,
    constraint uk_cart_items_trip unique (cart_id, trip_id),
    constraint ck_cart_items_seats check (seats > 0)
);

-- Blokady miejsc: jeden koszyk trzyma najwyżej jedną blokadę na wyjazd.
create table seat_holds (
    id         uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    version    bigint      not null default 0,
    trip_id    uuid        not null references trips (id) on delete cascade,
    cart_id    uuid        not null,
    order_id   uuid,
    seats      integer     not null,
    status     varchar(20) not null,
    expires_at timestamp with time zone not null,
    constraint uk_seat_holds_cart_trip unique (cart_id, trip_id),
    constraint ck_seat_holds_seats check (seats > 0)
);

create index ix_seat_holds_trip_status on seat_holds (trip_id, status, expires_at);
create index ix_seat_holds_order on seat_holds (order_id);

create table orders (
    id                  uuid primary key,
    created_at          timestamp with time zone not null,
    updated_at          timestamp with time zone not null,
    version             bigint       not null default 0,
    order_number        varchar(30)  not null unique,
    cart_id             uuid         not null,
    user_id             uuid,
    customer_first_name varchar(120) not null,
    customer_last_name  varchar(120) not null,
    customer_email      varchar(320) not null,
    customer_phone      varchar(40),
    customer_note       varchar(2000),
    status              varchar(30)  not null,
    amount_due_now      numeric(12, 2) not null,
    amount_paid         numeric(12, 2) not null default 0,
    trip_total          numeric(12, 2) not null,
    currency            varchar(3)   not null,
    payment_deadline    timestamp with time zone not null,
    paid_at             timestamp with time zone,
    cancelled_at        timestamp with time zone,
    access_token_hash   varchar(64)  not null
);

create index ix_orders_user on orders (user_id);
create index ix_orders_email on orders (customer_email);
create index ix_orders_status_deadline on orders (status, payment_deadline);

create table order_items (
    id               uuid primary key,
    created_at       timestamp with time zone not null,
    updated_at       timestamp with time zone not null,
    version          bigint       not null default 0,
    order_id         uuid         not null references orders (id) on delete cascade,
    trip_id          uuid         not null references trips (id),
    trip_slug        varchar(120) not null,
    trip_title       varchar(160) not null,
    seats            integer      not null,
    payment_mode     varchar(20)  not null,
    unit_price       numeric(12, 2) not null,
    deposit_per_seat numeric(12, 2) not null,
    amount_due_now   numeric(12, 2) not null,
    trip_total       numeric(12, 2) not null
);

create index ix_order_items_order on order_items (order_id);

create table payments (
    id             uuid primary key,
    created_at     timestamp with time zone not null,
    updated_at     timestamp with time zone not null,
    version        bigint        not null default 0,
    order_id       uuid          not null references orders (id) on delete cascade,
    provider       varchar(40)   not null,
    external_id    varchar(120)  not null unique,
    status         varchar(20)   not null,
    amount         numeric(12, 2) not null,
    currency       varchar(3)    not null,
    redirect_url   varchar(1000) not null,
    settled_at     timestamp with time zone,
    failure_reason varchar(500)
);

create index ix_payments_order on payments (order_id);

create table waitlist_entries (
    id         uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    version    bigint       not null default 0,
    trip_id    uuid         not null references trips (id) on delete cascade,
    name       varchar(160) not null,
    email      varchar(320) not null,
    phone      varchar(40),
    status     varchar(20)  not null,
    invited_at timestamp with time zone,
    constraint uk_waitlist_trip_email unique (trip_id, email)
);

create index ix_waitlist_trip on waitlist_entries (trip_id);
