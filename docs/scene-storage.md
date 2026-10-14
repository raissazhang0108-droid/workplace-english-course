# Course scene storage

The course scene editor stores lesson content such as titles, scenario descriptions, bilingual dialogue, vocabulary, quick phrases, and wording examples. It does not store test scenarios or quiz questions. A small SQLAlchemy persistence boundary keeps this data layer separate from the UI. By default, it writes to the existing SQLite file (`backend/data/quiz.sqlite3`; in Docker this is stored in the `quiz_data` volume).

To point the scene catalog at another SQLAlchemy-supported database, set `SCENES_DATABASE_URL` in the project `.env` file. Example for MySQL:

```dotenv
SCENES_DATABASE_URL=mysql+pymysql://username:password@db-host:3306/workplace_english
```

Create the target database first. SQLAlchemy creates the `course_scenes` table when the backend starts. The existing SQLite course rows are not copied automatically; export/import them before switching databases. Password characters that have special meaning in URLs must be URL-encoded.

The initial deployment keeps the SQLite file on the existing Docker named volume. For another database, use the connection URL for the new backend. Variable lesson sections are stored in SQLAlchemy's portable JSON type; the indexed title and category use standard string columns.
