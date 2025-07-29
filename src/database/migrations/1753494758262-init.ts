import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1753494758262 implements MigrationInterface {
    name = 'Init1753494758262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "postPath" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "follow" ("followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_2952595a5bec0052c5da0751cca" PRIMARY KEY ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "profilePic" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_user_like" ("userId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_1909cc878264424194b96b4a7ad" PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_550dce89df9570f251b6af2665a" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_e9f68503556c5d72a161ce38513" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_user_like" ADD CONSTRAINT "FK_6224fa184684ebb43370becc0da" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_user_like" ADD CONSTRAINT "FK_a4370c0acf977d4a562b8622e07" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_user_like" DROP CONSTRAINT "FK_a4370c0acf977d4a562b8622e07"`);
        await queryRunner.query(`ALTER TABLE "post_user_like" DROP CONSTRAINT "FK_6224fa184684ebb43370becc0da"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_e9f68503556c5d72a161ce38513"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_550dce89df9570f251b6af2665a"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`DROP TABLE "post_user_like"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "follow"`);
        await queryRunner.query(`DROP TABLE "post"`);
    }

}
