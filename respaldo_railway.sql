--
-- PostgreSQL database dump
--

\restrict dhDF6CHrBTumDTIYtsMsH6bFLvJBezEkorsi8vRnuloH7Vv77b10TYQGfFdI2xz

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccountStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountStatus" AS ENUM (
    'ACTIVE',
    'PENDING_CLAIM',
    'SUSPENDED'
);


ALTER TYPE public."AccountStatus" OWNER TO postgres;

--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountType" AS ENUM (
    'ARTIST',
    'INDUSTRY'
);


ALTER TYPE public."AccountType" OWNER TO postgres;

--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPER_ADMIN',
    'CURATOR',
    'MASTER_CURATOR'
);


ALTER TYPE public."AdminRole" OWNER TO postgres;

--
-- Name: AgeRange; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AgeRange" AS ENUM (
    'UNDER_18',
    'AGE_18_24',
    'AGE_25_34',
    'AGE_35_44',
    'AGE_45_PLUS'
);


ALTER TYPE public."AgeRange" OWNER TO postgres;

--
-- Name: BugReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BugReportStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."BugReportStatus" OWNER TO postgres;

--
-- Name: CreativeRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CreativeRequestStatus" AS ENUM (
    'PENDING',
    'REVIEWING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public."CreativeRequestStatus" OWNER TO postgres;

--
-- Name: CreativeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CreativeType" AS ENUM (
    'PHOTOGRAPHER',
    'WRITER',
    'DESIGNER',
    'VIDEOGRAPHER',
    'FAN',
    'OTHER'
);


ALTER TYPE public."CreativeType" OWNER TO postgres;

--
-- Name: FollowersRange; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FollowersRange" AS ENUM (
    'UNDER_1K',
    'FROM_1K_TO_10K',
    'FROM_10K_TO_50K',
    'FROM_50K_TO_100K',
    'FROM_100K_TO_500K',
    'OVER_500K'
);


ALTER TYPE public."FollowersRange" OWNER TO postgres;

--
-- Name: LabelStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LabelStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."LabelStatus" OWNER TO postgres;

--
-- Name: ListenersRange; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListenersRange" AS ENUM (
    'UNDER_1K',
    'FROM_1K_TO_10K',
    'FROM_10K_TO_50K',
    'FROM_50K_TO_100K',
    'FROM_100K_TO_500K',
    'OVER_500K'
);


ALTER TYPE public."ListenersRange" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'SUCCESS',
    'WARNING',
    'ERROR'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: Opportunity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Opportunity" AS ENUM (
    'WEEKLY',
    'SPOTIFY',
    'WEBRADIO',
    'ALBUM_STORY'
);


ALTER TYPE public."Opportunity" OWNER TO postgres;

--
-- Name: PremiumPrStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PremiumPrStatus" AS ENUM (
    'NONE',
    'REQUESTED',
    'APPROVED',
    'PAID',
    'REJECTED'
);


ALTER TYPE public."PremiumPrStatus" OWNER TO postgres;

--
-- Name: ReleaseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReleaseType" AS ENUM (
    'SINGLE',
    'EP',
    'ALBUM'
);


ALTER TYPE public."ReleaseType" OWNER TO postgres;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleType" AS ENUM (
    'ARTIST',
    'BAND',
    'MANAGEMENT',
    'PR',
    'AGENCY'
);


ALTER TYPE public."RoleType" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'AWAITING_PAYMENT',
    'PENDING',
    'IN_REVIEW',
    'CURATOR_APPROVED',
    'CURATOR_REJECTED',
    'MASTER_REVIEW',
    'ACCEPTED',
    'REJECTED',
    'PUBLISHED'
);


ALTER TYPE public."Status" OWNER TO postgres;

--
-- Name: StreamingPlatform; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StreamingPlatform" AS ENUM (
    'SPOTIFY',
    'SOUNDCLOUD',
    'DEEZER',
    'OTHER'
);


ALTER TYPE public."StreamingPlatform" OWNER TO postgres;

--
-- Name: Theme; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Theme" AS ENUM (
    'DARK',
    'LIGHT'
);


ALTER TYPE public."Theme" OWNER TO postgres;

--
-- Name: UILanguage; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UILanguage" AS ENUM (
    'EN',
    'ES',
    'FR'
);


ALTER TYPE public."UILanguage" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text NOT NULL,
    role public."AdminRole" DEFAULT 'CURATOR'::public."AdminRole" NOT NULL,
    "assignedGenres" text[] DEFAULT ARRAY[]::text[],
    theme public."Theme" DEFAULT 'DARK'::public."Theme" NOT NULL,
    language public."UILanguage" DEFAULT 'EN'::public."UILanguage" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- Name: BugReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BugReport" (
    id text NOT NULL,
    "userId" text,
    description text NOT NULL,
    url text,
    status public."BugReportStatus" DEFAULT 'OPEN'::public."BugReportStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminNotes" text
);


ALTER TABLE public."BugReport" OWNER TO postgres;

--
-- Name: CreativeRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CreativeRequest" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "creativeType" public."CreativeType" NOT NULL,
    "portfolioUrl" text,
    message text NOT NULL,
    status public."CreativeRequestStatus" DEFAULT 'PENDING'::public."CreativeRequestStatus" NOT NULL,
    "adminNotes" text,
    "reviewedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CreativeRequest" OWNER TO postgres;

--
-- Name: CreditTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CreditTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    credits integer NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    "stripeSessionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CreditTransaction" OWNER TO postgres;

--
-- Name: Donation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Donation" (
    id text NOT NULL,
    "userId" text,
    amount integer NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    "stripePaymentIntentId" text NOT NULL,
    status text NOT NULL,
    "donorName" text,
    "donorEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Donation" OWNER TO postgres;

--
-- Name: FunnelEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FunnelEvent" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    step integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    opportunity text,
    locale text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FunnelEvent" OWNER TO postgres;

--
-- Name: ManagedArtist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ManagedArtist" (
    id text NOT NULL,
    "industryUserId" text NOT NULL,
    "artistName" text NOT NULL,
    genre text,
    subgenre text,
    "spotifyUrl" text,
    instagram text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ManagedArtist" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Submission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Submission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "managedArtistId" text,
    "artistName" text NOT NULL,
    "trackTitle" text NOT NULL,
    "releaseType" public."ReleaseType" NOT NULL,
    "releaseDate" text,
    "streamingUrl" text NOT NULL,
    "streamingPlatform" public."StreamingPlatform",
    "spotifyUrl" text,
    instagram text,
    genres text[],
    subgenres text[],
    pitch text,
    "pressKitUrl" text,
    "senderName" text,
    opportunity public."Opportunity",
    channels text[],
    "fastTrack" boolean DEFAULT false NOT NULL,
    "fastTrackDeadline" timestamp(3) without time zone,
    "reviewRequested" boolean DEFAULT false NOT NULL,
    "premiumServices" text[],
    "premiumPrStatus" public."PremiumPrStatus" DEFAULT 'NONE'::public."PremiumPrStatus" NOT NULL,
    "premiumPaymentLink" text,
    "assignedPremiumServices" text[] DEFAULT ARRAY[]::text[],
    "premiumServicesPaid" boolean DEFAULT false NOT NULL,
    "premiumPaymentIntentId" text,
    "totalCostUsd" integer DEFAULT 0 NOT NULL,
    "autoFilledTitle" text,
    "autoFilledArtist" text,
    "autoFilledCover" text,
    "autoFillSource" text,
    status public."Status" DEFAULT 'PENDING'::public."Status" NOT NULL,
    "curatorId" text,
    "curatorNotes" text,
    "curatorRating" integer,
    "curatorReviewedAt" timestamp(3) without time zone,
    "masterCuratorId" text,
    "masterNotes" text,
    "masterRating" integer,
    placement text,
    "publicationUrl" text,
    "interviewUrl" text,
    "articleUrl" text,
    "publishedAt" timestamp(3) without time zone,
    "masterReviewedAt" timestamp(3) without time zone,
    "creditsUsed" integer DEFAULT 0 NOT NULL,
    "isFree" boolean DEFAULT true NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Submission" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    name text,
    image text,
    password text,
    "accountType" public."AccountType" DEFAULT 'ARTIST'::public."AccountType" NOT NULL,
    "artistName" text,
    "roleType" public."RoleType" DEFAULT 'ARTIST'::public."RoleType" NOT NULL,
    country text,
    state text,
    city text,
    bio text,
    genre text,
    subgenre text,
    "ageRange" public."AgeRange",
    "memberAgeRanges" jsonb,
    "bandSize" integer,
    "spotifyUrl" text,
    instagram text,
    tiktok text,
    youtube text,
    "soundcloudUrl" text,
    website text,
    "musicLanguages" text[],
    "careerStartYear" integer,
    "monthlyListeners" public."ListenersRange",
    "instagramFollowers" public."FollowersRange",
    "hasManager" boolean DEFAULT false NOT NULL,
    "legalName" text,
    "websiteUrl" text,
    "labelInstagram" text,
    "isVerifiedLabel" boolean DEFAULT false NOT NULL,
    "labelStatus" public."LabelStatus" DEFAULT 'PENDING_VERIFICATION'::public."LabelStatus" NOT NULL,
    "rejectionReason" text,
    theme public."Theme" DEFAULT 'DARK'::public."Theme" NOT NULL,
    language public."UILanguage" DEFAULT 'EN'::public."UILanguage" NOT NULL,
    "accountStatus" public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    "firstSubUsed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, email, name, password, role, "assignedGenres", theme, language, "createdAt", "updatedAt") FROM stdin;
cmpyrt19r0000y8si8eemme0r	virtuecontacto@gmail.com	virtuecontacto	$2b$12$j.4k6oOQpCM8sUH//awCxewfbljZIb6DdmeU8faLf7sqNBXHwBzQO	SUPER_ADMIN	{}	DARK	EN	2026-06-04 00:42:02.799	2026-06-04 00:51:00.143
cmpzmqloc000f01tlinj0dilk	nicolive99@hotmail.com	NIc	$2b$10$YRE619BkV6crg6XRlWDtkOCtc2s9rL2jacJ0ZnPz5B29x5hPXo8ZW	CURATOR	{Rock,Electronic,Hip-Hop,"R&B / Soul",Pop,"Folk / Acoustic",Latin,Jazz,Metal,"Ambient / Experimental",Other}	DARK	EN	2026-06-04 15:07:57.372	2026-06-04 15:07:57.372
cmpzli5fv000601tl8almg9y4	milyrose.bonnetbernier@gmail.com	Mily rose	$2b$12$MegRdNXkyjBYawMfP8UVgOI1tQdRVONbvUdkcWha2H/U3qXdiTInG	CURATOR	{Rock,Electronic,Hip-Hop,"R&B / Soul",Pop,"Folk / Acoustic",Latin,Jazz,Metal,"Ambient / Experimental",Other}	DARK	EN	2026-06-04 14:33:23.467	2026-06-14 19:06:50.476
cmpz0dwp8000101tl7upj77pj	alanaaishahk@gmail.com	Alana Ash	$2b$12$U7h7mq6Rds/x5MveDjFinO//YxCGREoCl8mJY277ixAVB6D33ptzC	MASTER_CURATOR	{}	DARK	EN	2026-06-04 04:42:13.58	2026-06-15 17:10:00.038
cmqfhle7r000a01qgpxpqkspx	alexa05leilani@gmail.com	ALEXA	$2b$10$CozN9tLxdgI1oF7tUiz1Be5ZekA02YaythW7kiaPFLsPmoHXAFimu	CURATOR	{Rock,Electronic,Hip-Hop,"R&B / Soul",Pop,"Folk / Acoustic",Latin,Jazz,Metal,"Ambient / Experimental",Other}	DARK	EN	2026-06-15 17:28:15.159	2026-06-15 17:28:15.159
\.


--
-- Data for Name: BugReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BugReport" (id, "userId", description, url, status, "createdAt", "adminNotes") FROM stdin;
cmqe70d6k000001qqchyg4k0d	cmqd0tkd1000001qrpcsi5ctk	Hola	/en/portal/profile	CLOSED	2026-06-14 19:44:11.708	\N
\.


--
-- Data for Name: CreativeRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CreativeRequest" (id, name, email, "creativeType", "portfolioUrl", message, status, "adminNotes", "reviewedById", "createdAt", "updatedAt") FROM stdin;
cmq12kqyq000k01tlwpwh74fa	Rose	lara.rodrigo.1cm@gmail.com	FAN	https://www.instagram.com/pedrichaconn/	heruygbhfiusdghyfbpdsiufhsdpfoiush	REJECTED	\N	cmpz0dwp8000101tl7upj77pj	2026-06-05 15:19:04.322	2026-06-14 20:33:37.728
\.


--
-- Data for Name: CreditTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CreditTransaction" (id, "userId", amount, type, credits, currency, "stripeSessionId", "createdAt") FROM stdin;
cmqecvplg000001qgkxodib7d	cmpz07svd000001tlz6rf5t3t	400	PURCHASE	5	usd	cs_live_a1iVduV9l5xZGNczqQQrvi459PMD4IfoGuYaZ8txcf1XonbwJ0eGj7lenk	2026-06-14 22:28:32.213
cmqedc4f6000101qg5dg0p5m4	cmqd0tkd1000001qrpcsi5ctk	400	PURCHASE	5	usd	cs_live_a1STC27fDDGNvPjMxUpu32ec99XRFjkrBl2hp82UwTqcIQiXfAQm1PDaSz	2026-06-14 22:41:17.922
\.


--
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Donation" (id, "userId", amount, currency, "stripePaymentIntentId", status, "donorName", "donorEmail", "createdAt") FROM stdin;
\.


--
-- Data for Name: FunnelEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FunnelEvent" (id, "sessionId", step, completed, opportunity, locale, "createdAt") FROM stdin;
\.


--
-- Data for Name: ManagedArtist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ManagedArtist" (id, "industryUserId", "artistName", genre, subgenre, "spotifyUrl", instagram, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, message, type, link, "isRead", "createdAt", "updatedAt") FROM stdin;
cmpzm74or000c01tlbiz6kl5l	cmpzloul6000801tl8dysnou8	Submission Accepted	Your track "I've Wasted So Much Time" was accepted for placement!	SUCCESS	\N	f	2026-06-04 14:52:48.891	2026-06-04 14:52:48.891
cmpzmuo57000g01tlgv8oelmu	cmpzm0u11000a01tl4kr5fret	Submission Reviewed	Your track "lose control" was reviewed but not accepted.	INFO	\N	t	2026-06-04 15:11:07.195	2026-06-05 15:07:12.518
cmpzmwdhr000h01tlg77u89e2	cmpzm0u11000a01tl4kr5fret	Submission Accepted	Your track "r u kissin any1?" was accepted for placement!	SUCCESS	\N	t	2026-06-04 15:12:26.703	2026-06-05 15:07:12.518
cmq86o7tv000m01tlfeomg5ln	cmpz10org000301tllj6uof6c	Submission Reviewed	Your track "Elephant" was reviewed but not accepted.	INFO	\N	f	2026-06-10 14:48:07.843	2026-06-10 14:48:07.843
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Submission" (id, "userId", "managedArtistId", "artistName", "trackTitle", "releaseType", "releaseDate", "streamingUrl", "streamingPlatform", "spotifyUrl", instagram, genres, subgenres, pitch, "pressKitUrl", "senderName", opportunity, channels, "fastTrack", "fastTrackDeadline", "reviewRequested", "premiumServices", "premiumPrStatus", "premiumPaymentLink", "assignedPremiumServices", "premiumServicesPaid", "premiumPaymentIntentId", "totalCostUsd", "autoFilledTitle", "autoFilledArtist", "autoFilledCover", "autoFillSource", status, "curatorId", "curatorNotes", "curatorRating", "curatorReviewedAt", "masterCuratorId", "masterNotes", "masterRating", placement, "publicationUrl", "interviewUrl", "articleUrl", "publishedAt", "masterReviewedAt", "creditsUsed", "isFree", "submittedAt") FROM stdin;
cmpz11np8000501tlc5opudoy	cmpz10org000301tllj6uof6c	\N	Tame Impala	Dracula	SINGLE	\N	https://open.spotify.com/intl-es/track/1NXbNEAcPvY5G1xvfN57aA?si=dba39b808ef04613	\N	\N	N/A	{"Folk / Acoustic"}	{asd}	\N	\N	\N	\N	{RADAR,INTERNET_WAVE,SPOTIFY_PLAYLIST,STORIES}	t	2026-06-06 05:02:26.409	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273208500450dcd0fd294d7bd3b	opengraph	AWAITING_PAYMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	f	2026-06-04 05:00:41.66
cmpzm0u18000b01tl0g908bcw	cmpzm0u11000a01tl4kr5fret	\N	Joey Cash	r u kissin any1?	SINGLE	\N	https://open.spotify.com/track/2CQoxS48ebF715bzy1m6Je?si=6efc9301c4054d67	\N	\N	joaeycash	{Indie}	{"Indie Sleaze"}	\N	\N	\N	\N	{INTERNET_WAVE}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b2733008824ccdfacbf679149bf9	opengraph	ACCEPTED	cmpzli5fv000601tl8almg9y4	HGUYGU	5	2026-06-04 15:11:36.078	cmpz0dwp8000101tl7upj77pj		5	Internet Wave	\N	\N	\N	\N	2026-06-04 15:12:26.694	0	t	2026-06-04 14:47:55.148
cmq125ohu000i01tl5zgaks7a	cmpzm0u11000a01tl4kr5fret	\N	Joey Cash	r u kissin any1?	SINGLE	\N	https://open.spotify.com/track/2CQoxS48ebF715bzy1m6Je?si=8f2e8f37db144b52	\N	\N	joaeycash	{Indie}	{"Indie Sleaze"}	\N	\N	\N	\N	{RADAR,INTERNET_WAVE,SPOTIFY_PLAYLIST,STORIES}	t	2026-06-07 15:07:21.28	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b2733008824ccdfacbf679149bf9	opengraph	AWAITING_PAYMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	f	2026-06-05 15:07:21.283
cmpzlould000901tlhpt6h9b8	cmpzloul6000801tl8dysnou8	\N	Enjoy	I've Wasted So Much Time	SINGLE	\N	https://open.spotify.com/track/5kjZTaA2gcDjfRKbNI3W7E?si=75c23f19a6c24b4d	\N	\N	enjoy	{Indie}	{"Punk Indie"}	\N	\N	\N	\N	{RADAR}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273fe8635cfed2a493b82795262	opengraph	ACCEPTED	cmpzli5fv000601tl8almg9y4		4	2026-06-04 14:52:17.543	cmpz0dwp8000101tl7upj77pj		4	Radar	\N	\N	\N	\N	2026-06-04 14:52:48.88	0	t	2026-06-04 14:38:36.001
cmq12b5ti000j01tlqniotqtl	cmpzm0u11000a01tl4kr5fret	\N	Joey Cash	what do you want me to do?	SINGLE	\N	https://open.spotify.com/track/0rfA0I4IhArbfqa8wXZP3m?si=a21e467c203a4bf4	\N	\N	joaeycash	{Indie}	{"Indie Sleaze"}	\N	\N	\N	\N	{RADAR}	t	2026-06-07 15:11:37.013	f	{ARTICLE,INTERVIEW}	REQUESTED	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273f5d8906500959f72feefc312	opengraph	AWAITING_PAYMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	f	2026-06-05 15:11:37.014
cmqfftlud000501qgw3dbtf6o	cmqfftlu7000401qgnz5wtovx	\N	GEMM	Pennywise	SINGLE	\N	https://soundcloud.com/gemmrockaz/pennywise/s-m8UDxBx0TqN?si=7196c5e39243453c9b7fbc1af38bf736&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing	\N	\N	@gemmrockaz	{Rock}	{"Alternative Rock, Pop Rock, Grunge Pop"}	\N	\N	\N	\N	{RADAR,INTERNET_WAVE,SPOTIFY_PLAYLIST,STORIES}	t	2026-06-17 16:38:39.06	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i1.sndcdn.com/artworks-ZIOXaLMSBjy9Tyjn-JhuCsw-t500x500.png	opengraph	IN_REVIEW	cmqfhle7r000a01qgpxpqkspx	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 16:38:39.061
cmqfgg8f0000701qgvcu6kir8	cmqfgg8eq000601qg1ks35r0v	\N	Ear Ringers	Kiss	SINGLE	\N	https://open.spotify.com/track/5llP4iYgUfkbdQxzgDMWCu?si=E2PhYry-QWG0jPe9x_pnBw	\N	\N	@ear.ringers	{Rock}	{"Alternative pop rock "}	\N	\N	\N	\N	{STORIES}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273aaf6590200969c9f2f9d4003	opengraph	IN_REVIEW	cmpzli5fv000601tl8almg9y4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 16:56:14.748
cmpzmbzn7000e01tlirr54twm	cmpzm0u11000a01tl4kr5fret	\N	Joey Cash	lose control	SINGLE	\N	https://open.spotify.com/track/6nyWL7BR75KiXF2WQoy1L4?si=e8048d6edcb04add	\N	\N	joaeycash	{Indie}	{"Indie Sleaze"}	\N	\N	\N	\N	{RADAR}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273ce42b1d526c43bce06defb71	opengraph	CURATOR_REJECTED	cmpzmqloc000f01tlinj0dilk		1	2026-06-04 15:11:07.184	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-04 14:56:35.635
cmpz10orn000401tlnkfsvirs	cmpz10org000301tllj6uof6c	\N	Tame Impala	Elephant	SINGLE	\N	https://open.spotify.com/intl-es/track/6qZjm61s6u8Ead9sWxCDro?si=d117a14833fc4bc0	\N	\N	daniel	{"Folk / Acoustic"}	{asd}	\N	\N	\N	\N	{RADAR}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273370c12f82872c9cfaee80193	opengraph	CURATOR_REJECTED	cmpzli5fv000601tl8almg9y4		5	2026-06-10 14:48:07.837	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-04 04:59:56.387
cmqd0tkd9000101qrp7d8e78j	cmqd0tkd1000001qrpcsi5ctk	\N	Ecca Vandal	CRUISING TO SELF SOOTHE	SINGLE	\N	https://open.spotify.com/track/4cErKi16sjFZOfd85t9dnt?si=7a8449ebbeeb4bc6	\N	\N	rodddd	{Rock}	{"New Rock"}	\N	\N	\N	\N	{RADAR}	t	2026-06-16 00:03:10.553	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b2736d8195570025f97b289bf2f7	opengraph	IN_REVIEW	cmpzli5fv000601tl8almg9y4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-14 00:03:10.557
cmqek116d000301qgnrjuelg4	cmqek1166000201qguke40l8x	\N	Sydney J	Angel baby 	SINGLE	\N	https://sydneyjmusic.bandcamp.com/track/angel-baby	\N	\N	sydneyjmusic_	{"Folk / Acoustic"}	{"indie-folk "}	\N	\N	\N	\N	{INTERNET_WAVE}	t	2026-06-17 01:48:37.811	f	{}	NONE	\N	{}	f	\N	0	\N	\N			IN_REVIEW	cmpzmqloc000f01tlinj0dilk	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 01:48:37.813
cmqfghnnw000901qgw4wlmnhm	cmqfghnnq000801qguwjx05vf	\N	T9YSHA	live, forever - Album	ALBUM	\N	https://open.spotify.com/album/5yFuHfXnc04uJR3NoNj4Au?si=XfivJ8K8Qd6scODEyDaGUw	\N	\N	@t9ysha	{Indie}	{"Pop, blues, alternative "}	\N	\N	\N	\N	{RADAR,INTERNET_WAVE,SPOTIFY_PLAYLIST,STORIES}	t	2026-06-17 16:57:21.162	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b2734f08b4f2499f686585e6dc10	opengraph	IN_REVIEW	cmpzmqloc000f01tlinj0dilk	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 16:57:21.164
cmqfhoc1b000c01qg873x3cnb	cmqfhoc16000b01qgz8xoye5f	\N	Lux Solaire	Solaire - Album	ALBUM	\N	https://open.spotify.com/album/3TUmNXRTNgaRek1fqTLxT6?si=aAZNIqxRS_iU-sm-cZ-zTQ	\N	\N	@lux.solaire	{"Ambient / Experimental"}	{"Electroacoustic, Drone, Sound Art"}	\N	\N	\N	\N	{RADAR,INTERNET_WAVE,SPOTIFY_PLAYLIST,STORIES}	f	\N	t	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273093a46b1b1e75315ffe1cea5	opengraph	IN_REVIEW	cmqfhle7r000a01qgpxpqkspx	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 17:30:32.303
cmqfi530o000e01qgc4i5w6f5	cmqfi530j000d01qgsdz1o81d	\N	Thornhill	Views from the Sun	SINGLE	\N	https://open.spotify.com/track/68Y84dhYPIE0kHs13otJjy?si=EoHoj-xuRkynvBFAxRFbKg	\N	\N	@nicfuckingreis	{Metal}	{"Progressive Metalcore"}	\N	\N	\N	\N	{STORIES}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b27372d94b4095d2af79fa84e159	opengraph	IN_REVIEW	cmpzli5fv000601tl8almg9y4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 17:43:33.768
cmqficv9l000g01qggjaygzcn	cmqficv9f000f01qgcjr1bjb8	\N	The Eighth Wonder	Regret	SINGLE	\N	https://open.spotify.com/track/1JaUXfmcIFkGW9pwa29CoW?si=fbdf6b881d9b4e40	\N	\N	@theeighthwonderoffical	{Indie}	{"Indie Rock"}	\N	\N	\N	\N	{SPOTIFY_PLAYLIST}	f	\N	f	{}	NONE	\N	{}	f	\N	0	\N	\N	https://i.scdn.co/image/ab67616d0000b273db8c49f0195fe1e90f234341	opengraph	IN_REVIEW	cmpzmqloc000f01tlinj0dilk	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	t	2026-06-15 17:49:36.969
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "emailVerified", name, image, password, "accountType", "artistName", "roleType", country, state, city, bio, genre, subgenre, "ageRange", "memberAgeRanges", "bandSize", "spotifyUrl", instagram, tiktok, youtube, "soundcloudUrl", website, "musicLanguages", "careerStartYear", "monthlyListeners", "instagramFollowers", "hasManager", "legalName", "websiteUrl", "labelInstagram", "isVerifiedLabel", "labelStatus", "rejectionReason", theme, language, "accountStatus", credits, "firstSubUsed", "createdAt", "updatedAt") FROM stdin;
cmpz10org000301tllj6uof6c	evaristo.camargo.daniel@gmail.com	\N	Tame Impala	\N	$2b$12$liSujYYk.BQgU40e7ZkRqegwhwwTQ4IV3NLgQ0234Vr.9ZZC8UybS	ARTIST	Tame Impala	ARTIST	AZ	Ganja	\N		Electronic	afdaf	AGE_25_34	\N	\N	\N	N/A	N/A	N/A	\N	N/A	{en}	\N	FROM_1K_TO_10K	FROM_1K_TO_10K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-04 04:59:56.38	2026-06-04 05:01:34.544
cmqfhoc16000b01qgz8xoye5f	neolux.mgmt@gmail.com	2026-06-15 17:35:36.993	Lux Solaire	\N	$2b$12$sWYaO1Bapk3dzDpvzixNMeNcPKeXDVzmRe4xwUa5.CLqTIGEXpWU6	ARTIST	Lux Solaire	ARTIST	NO	\N	\N	Lux Solaire (They/He) is an art project seeking a path to the soul of its author. Combining modern experimental and improvisation techniques like electroacoustic and musique concrète with ambient, new age, drone, and electronic their work exists at the edge of art, meditative practice/session and neurodivergent queer experience.	Ambient / Experimental	Electroacoustic, New Age, Ambient, Drone, Electronic&lt; Minimalism	AGE_25_34	\N	\N	\N	@lux.solaire	N/A	https://www.youtube.com/@luxsolaire	\N	https://luxsolaire.crd.co	{other}	2022	UNDER_1K	UNDER_1K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 17:30:32.298	2026-06-15 17:35:36.994
cmqfftlu7000401qgnz5wtovx	gemmrockaz@gmail.com	2026-06-15 16:45:35.717	GEMM	\N	$2b$12$4vwFmtsFluLSJ76PgcSxEu0VGozqLxMCpeoMXiE4q.Z.NS7S98s32	ARTIST	GEMM	BAND	US	Arizona	Phoenix	Phoenix-based group Gemm has been making loud, in-your-face rock music since 2021 through honest lyrics, passionate vocal melodies, driving guitars, thunderous bass lines, and power behind the kit.	Rock	Alternative Rock, Pop Rock, Grunge Pop	AGE_25_34	["", ""]	2		@gemmrockaz	@gemmrockaz	https://www.youtube.com/@Gemmrockaz		https://gemmrockaz.com/	{en}	2021	UNDER_1K	FROM_1K_TO_10K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 16:38:39.056	2026-06-15 16:45:45.743
cmpzloul6000801tl8dysnou8	lara.rodrigo.1cm@gmail.com	2026-06-04 14:41:30.747	Enjoy	\N	$2b$12$lcdFBOCMrBN.iMScEWQA3uj759nbv7LxGFjV1e6L1PzLVpKBafkZ.	ARTIST	Enjoy	ARTIST	US	California	Los Angeles		Indie	Punk Indie	AGE_18_24	["", ""]	2		enjoy	N/A	N/A		N/A	{en}	2002	FROM_100K_TO_500K	FROM_10K_TO_50K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-04 14:38:35.994	2026-06-04 14:41:39.012
cmpzm0u11000a01tl4kr5fret	megadeth_02@hotmail.com	2026-06-04 14:54:15.918	Joey Cash	\N	$2b$12$7tzT52tMstk1AKKrHHulTeOw3UFAcRUtjay43Pm4fPMdpbh3chhYe	ARTIST	Joey Cash	ARTIST	US	California	Los Angeles		Indie	Indie Sleaze	AGE_18_24	["", ""]	2		joaeycash	N/A	N/A		N/A	{en}	2020	FROM_50K_TO_100K	FROM_100K_TO_500K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-04 14:47:55.141	2026-06-05 15:09:36.242
cmqfghnnq000801qguwjx05vf	taysha9@icloud.com	\N	T9YSHA	\N	$2b$12$jQKBXXEte85TjlzZSuNvX.VDpqPOR2P50Hc9LaziqgYwR0ObN9Gy.	ARTIST	T9YSHA	ARTIST	\N	\N	\N	\N	Indie	Pop, blues, alternative 	\N	\N	\N	\N	@t9ysha	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 16:57:21.158	2026-06-15 16:57:21.158
cmqfgg8eq000601qg1ks35r0v	info@earringers.com	\N	Ear Ringers	\N	$2b$12$Q8h/GHgFhlZnx5LJgjLseeveINvwuMcCoRX/1.rZwFnOgiq26KPmy	ARTIST	Ear Ringers	BAND	US	California	Los Angeles	Emerging from East Los Angeles in 2017, Ear Ringers has spent years carving out an alternative pop-rock sound that prioritizes raw honesty over polished perfection. They deal in the "uncomfortably authentic"—capturing the messy parts of love, heartbreak, and nostalgia that most people prefer to keep internal.\nTheir new album, "Keep It To Yourself ," is a reflection of the four years lived since their last full length release “Heart Therapy”.	Indie	Alternative pop rock	AGE_25_34	\N	\N	\N	@ear.ringers	@ear.ringers	https://www.youtube.com/@ear.ringers	\N	https://earringers.com/	{en,es}	2017	FROM_50K_TO_100K	FROM_1K_TO_10K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 16:56:14.738	2026-06-15 17:00:41.113
cmq14ti53000l01tlnh0n73z0	pfr.sounds@gmail.com	\N	PFR Records	\N	$2b$12$BCPB8/2rrVwSKMBbnXnzoOiclhG13OM4b2VRqKOXE53Rbtij5bQuq	INDUSTRY	\N	MANAGEMENT	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	PFR Records	https://www.pfr-records.com/		t	APPROVED	\N	DARK	EN	ACTIVE	0	f	2026-06-05 16:21:52.023	2026-06-14 20:35:44.894
cmpz07svd000001tlz6rf5t3t	danievaristoc@gmail.com	2026-06-04 04:38:19.679	danievaristoc	\N	$2b$12$Ipe1Ns6WCfMqIxRNfcGrjeGecFistRFBRoN5Ys2tCNYgwEwp7vz/O	ARTIST	\N	ARTIST	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	APPROVED	\N	DARK	EN	ACTIVE	5	f	2026-06-04 04:37:28.681	2026-06-14 22:28:32.216
cmqd0tkd1000001qrpcsi5ctk	personal.lavezrodrigo@outlook.com	2026-06-14 00:07:32.517	Ecca Vandal	\N	$2b$12$e2bNSd4J3xdrZ5jbCYHWe.XG2nwKcRmewPr9kqVO1bVQcGfVB3nka	ARTIST	Ecca Vandal	ARTIST	US	California	Los Angeles	Heyyy	Rock	New Rock	AGE_25_34	\N	\N	\N	N/A	N/A	N/A	\N	N/A	{en}	2002	FROM_100K_TO_500K	OVER_500K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	5	f	2026-06-14 00:03:10.549	2026-06-14 22:41:17.925
cmqek1166000201qguke40l8x	sydney.jenkins@juilliard.edu	\N	Sydney J	\N	$2b$12$8UVQrUxgzy009vlwQjoMjOn0T1vkp6LZjrOmSbh6i12xRs.zhQFdO	ARTIST	Sydney J	ARTIST	US	New York	Manhattan	Sydney J is an emerging indie folk singer-songwriter whose music captures the quiet intensity of human connection and the beauty found in life’s in-between moments. With a voice that feels both intimate and expansive, she blends delicate acoustic textures with emotionally honest storytelling, drawing listeners into songs that linger long after the final note.\nRooted in the indie folk tradition, Sydney J’s sound is marked by warm guitar arrangements, understated melodies, and lyrics that explore	Folk / Acoustic	indie-folk	AGE_18_24	\N	\N	\N	sydneyjmusic_	sydneyj_music	https://www.youtube.com/@sydneyj_17	\N	https://sydneyjenkins6.wixsite.com/sydney-j	{en}	2020	UNDER_1K	FROM_1K_TO_10K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 01:48:37.806	2026-06-15 01:51:26.756
cmqficv9f000f01qgcjr1bjb8	theeighthwondercontact@gmail.com	\N	The Eighth Wonder	\N	$2b$12$x9ZD5ljCZ0HnBCkEXE8F5OuEpcZCsBaTy5Mlmm7ePHF6bhk.cvtQe	ARTIST	The Eighth Wonder	ARTIST	GB	Birmingham	\N	17 YEAR OLD INDIE ROCK ARTIST - Liam Bunn	Indie	Indie Rock	UNDER_18	\N	\N	\N	@theeighthwonderoffical	@theeighthwondermusic	https://www.youtube.com/channel/UC-xncc7LN5dZR57QMb_9TMw	\N	https://theeighthwondermusic.neocities.org/	{en}	2023	UNDER_1K	UNDER_1K	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 17:49:36.963	2026-06-15 17:50:39.48
cmqfi530j000d01qgsdz1o81d	nicolereis.work@gmail.com	\N	Thornhill	\N	$2b$12$srvM9JR4YGU8hO6oiKbWEOANyjxFgVC2kq8XpqIPRSTa.uPrrxzLe	ARTIST	Thornhill	ARTIST	\N	\N	\N	\N	Metal	Progressive Metalcore	\N	\N	\N	\N	@nicfuckingreis	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	PENDING_VERIFICATION	\N	DARK	EN	ACTIVE	0	f	2026-06-15 17:43:33.763	2026-06-15 17:43:33.763
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
evaristo.camargo.daniel@gmail.com	357725	2026-06-05 04:59:56.397
sydney.jenkins@juilliard.edu	707389	2026-06-16 01:48:37.822
info@earringers.com	129830	2026-06-16 16:56:14.756
taysha9@icloud.com	582842	2026-06-16 16:57:21.173
neolux/mgmt@gmail.com	476840	2026-06-16 17:30:32.312
nicolereis.work@gmail.com	236213	2026-06-16 17:43:33.778
theeighthwondercontact@gmail.com	433970	2026-06-16 17:49:36.977
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: BugReport BugReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BugReport"
    ADD CONSTRAINT "BugReport_pkey" PRIMARY KEY (id);


--
-- Name: CreativeRequest CreativeRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreativeRequest"
    ADD CONSTRAINT "CreativeRequest_pkey" PRIMARY KEY (id);


--
-- Name: CreditTransaction CreditTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Donation Donation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_pkey" PRIMARY KEY (id);


--
-- Name: FunnelEvent FunnelEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FunnelEvent"
    ADD CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY (id);


--
-- Name: ManagedArtist ManagedArtist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManagedArtist"
    ADD CONSTRAINT "ManagedArtist_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: CreditTransaction_stripeSessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CreditTransaction_stripeSessionId_key" ON public."CreditTransaction" USING btree ("stripeSessionId");


--
-- Name: Donation_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Donation_stripePaymentIntentId_key" ON public."Donation" USING btree ("stripePaymentIntentId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BugReport BugReport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BugReport"
    ADD CONSTRAINT "BugReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreditTransaction CreditTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Donation Donation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ManagedArtist ManagedArtist_industryUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManagedArtist"
    ADD CONSTRAINT "ManagedArtist_industryUserId_fkey" FOREIGN KEY ("industryUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_curatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Submission Submission_managedArtistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_managedArtistId_fkey" FOREIGN KEY ("managedArtistId") REFERENCES public."ManagedArtist"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Submission Submission_masterCuratorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_masterCuratorId_fkey" FOREIGN KEY ("masterCuratorId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Submission Submission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict dhDF6CHrBTumDTIYtsMsH6bFLvJBezEkorsi8vRnuloH7Vv77b10TYQGfFdI2xz

