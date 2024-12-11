# Instructions for Setting Up MySQL Workbench and Docker

## Download MySQL Workbench

1. Visit the [MySQL Workbench download page](https://dev.mysql.com/downloads/workbench/).
2. Select your operating system.
3. Download and install the appropriate version for your system.

## Run Docker-Compose

1. Ensure Docker is installed on your system. If not, download and install it from [Docker's official website](https://www.docker.com/get-started).
2. Make sure that terminal is standing on this directory :

   ```sh
   ../e-paper/db
   ```

3. Run the following command to start your Docker containers:

   ```sh
   docker-compose up -d
   ```

## If your Database Management Software ( like DBeaver or Workbench ) support to use URL, so here is the URL :

`mysql://root:root@localhost:33061/e_paper`

## If you use DBeaver and use the URL above, you need to set the password: root for "root" username and In the 'Driver Properties' tab, set "allowPublicKeyRetrieval" into TRUE and "useSSL" into FALSE

# Or

## Scan Database in MySQL Workbench

1. Open MySQL Workbench.
2. Click on the `+` icon to create a new connection.
3. Enter the connection details:
   - Connection Name: `EPaperLocalDB`
   - Hostname: `localhost`
   - Port: `33061`
   - Username: `root`
   - Password: `root`
   - Default_schema: e_paper
4. Click `Test Connection`.

Another way is click on `Rescan for Local MySQL Instances` at the Welcome page of Workbench.

### Enter Password for Root User

- If prompted, enter the password `admin123` for the root user.
- If the pop-up for entering the root user password does not appear:
  1. Right-click on the connection.
  2. Select `Edit Connection`.
  3. Enter the password `admin123` for the root user.
  4. Click `OK`.

You should now be able to connect to your MySQL database and start working with it in MySQL Workbench.
