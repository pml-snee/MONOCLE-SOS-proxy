CREATE TABLE "users" (
	"id" serial NOT NULL,
	"username" VARCHAR(255) NOT NULL,
	"password" VARCHAR(255) NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "access_tokens" (
	"user" integer NOT NULL,
	"token" VARCHAR(32) NOT NULL,
	"sensor" integer NOT NULL,
	"id" serial NOT NULL,
	"token_gen_date" TIMESTAMP NOT NULL,
	CONSTRAINT access_tokens_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "sensors" (
	"id" serial NOT NULL,
	"sensor_name" VARCHAR(255) NOT NULL,
	CONSTRAINT sensors_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "access_tokens" ADD CONSTRAINT "access_tokens_fk0" FOREIGN KEY ("user") REFERENCES "users"("id");
ALTER TABLE "access_tokens" ADD CONSTRAINT "access_tokens_fk1" FOREIGN KEY ("sensor") REFERENCES "sensors"("id");
