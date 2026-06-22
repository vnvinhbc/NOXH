param(
  [string]$JdbcUrl = $env:DB_JDBC_URL,
  [string]$DbUser = $env:DB_USERNAME,
  [string]$DbPassword = $env:DB_PASSWORD,
  [string]$SqlFile = "$PSScriptRoot\seed-lottery-test-data.sql"
)

$ErrorActionPreference = "Stop"

if (-not $JdbcUrl) {
  throw "Missing JDBC URL. Pass -JdbcUrl or set DB_JDBC_URL."
}
if (-not $DbUser) {
  throw "Missing DB user. Pass -DbUser or set DB_USERNAME."
}
if (-not $DbPassword) {
  throw "Missing DB password. Pass -DbPassword or set DB_PASSWORD."
}
if (-not (Test-Path -LiteralPath $SqlFile)) {
  throw "SQL file not found: $SqlFile"
}

$driver = Get-ChildItem -Path "$env:USERPROFILE\.m2\repository\org\postgresql\postgresql" -Recurse -Filter "postgresql-*.jar" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $driver) {
  throw "PostgreSQL JDBC driver not found in Maven cache. Run backend Maven build first."
}

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("noxh-seed-" + [System.Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$javaFile = Join-Path $tmpDir "SeedSqlRunner.java"
$javaSource = @'
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class SeedSqlRunner {
    public static void main(String[] args) throws Exception {
        String jdbcUrl = args[0];
        String user = args[1];
        String password = args[2];
        String sqlPath = args[3];

        String sql = Files.readString(Path.of(sqlPath));
        try (Connection connection = DriverManager.getConnection(jdbcUrl, user, password);
             Statement statement = connection.createStatement()) {
            statement.execute(sql);

            printCount(statement, "test_users",
                    "select count(*) from users where email like 'lotterytest%@noxh.local'");
            printCount(statement, "approved_test_applications",
                    "select count(*) from applications a join users u on u.id = a.user_id where u.email like 'lotterytest%@noxh.local' and a.status = 'APPROVED'");
            printCount(statement, "priority_test_applications",
                    "select count(*) from applications a join users u on u.id = a.user_id where u.email like 'lotterytest%@noxh.local' and a.priority_score = 100");
            printCount(statement, "available_test_apartments",
                    "select count(*) from apartment_unit where apartment_code like 'TEST-LT-%' and status = 'AVAILABLE'");
            printCount(statement, "available_project_apartments",
                    "select count(*) from apartment_unit au join projects p on p.id = au.project_id where p.name = 'Lottery Test - 200 Ho So / 80 Can Ho' and au.status = 'AVAILABLE'");
        }
    }

    private static void printCount(Statement statement, String label, String sql) throws Exception {
        try (ResultSet rs = statement.executeQuery(sql)) {
            rs.next();
            System.out.println(label + "=" + rs.getLong(1));
        }
    }
}
'@

[System.IO.File]::WriteAllText($javaFile, $javaSource, [System.Text.UTF8Encoding]::new($false))

javac -cp $driver.FullName $javaFile
java -cp "$($driver.FullName);$tmpDir" SeedSqlRunner $JdbcUrl $DbUser $DbPassword $SqlFile

Remove-Item -LiteralPath $tmpDir -Recurse -Force
