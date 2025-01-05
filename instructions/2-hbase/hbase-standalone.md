# HBase in Standalone Mode

## 1. Pull the required Docker Images and use them to create and run the Docker Containers

Delete the 4 previous containers then create and run the Docker containers specified in [Docker-Compose.yaml](Docker-Compose.yaml) i.e.,

* HBase-Master
* HBase-Regionserver
* Zookeeper

## 2. Connect to the HBase Shell hosted in the `hbase-master` Docker Container

HBase Shell is a JRuby-based command-line program you can use to interact with HBase.

```shell
docker exec -it hbase-master hbase shell
```

You can also confirm that HBase is running via its Web-UI: [http://localhost:16010/](http://localhost:16010/)

Execute the following statements in HBase shell:

```shell
# To show the version of HBase (it should be version 2.1.3)
version

# To show the details of the servers running HBase:
# The output according to the setup should be:
# 1 active master, 0 backup masters, 1 servers, 0 dead, 2.0000 average load
status
```

## 3. Getting Help

To get guidance on a specific command:

```shell
# Replace COMMAND with the command you want guidance on
help 'COMMAND'
```

For general guidance on how to use table-referenced commands.

```shell
table_help
```

## 4. Create a Table

The table emp has 2 column families:

* personal data
* professional data

```shell
create 'emp', 'personal data', 'professional data'
create 'employee', 'Personally_Identifiable_Information_PII', 'KPI_Appraisal'

create 'wiki', 'text' 
```

The table `wiki` has 1 column family:

* text

```shell
create 'wiki', 'text' 
```

Verify that the table has been created:

```shell
list
```

## 5. View the table's metadata

Execute the following to view the metadata of the created table:

```shell
describe 'wiki'
```

## 6. Insert data

We use the keyword `put` to insert data in HBase. The following statement inserts a new record with the key **`Home`** adding **`Welcome to the wiki!`** to the column family `text:`. If there was a specific column in the column family, then it would be specified as `[column family]:[column]`

```shell
put 'wiki', 'Home', 'text:', 'Welcome to the wiki!'
```

Unfortunately, the `put` command in HBase shell allows you to insert only one column value at a time.

## 7. Retrieve data

We use the keyword `get` to retrieve data from HBase. `get` requires the **table name** and the **row key**.

```shell
get 'wiki', 'Home', 'text:'
```

We use the keyword `scan` to retrieve all the rows. This is compute-intensive for large databases and should be avoided in production. By default, HBase uses the current timestamp when inserting data and the most recent timestamp when retrieving data.

```shell
scan 'wiki'
```

## 8. Altering Tables

Altering tables is computationally expensive because HBase creates a new column family with the chosen specifications and then copies all the data to the new column.

* Disable the table

```shell
disable 'wiki'
```

By default, HBase stores only 3 versions of values (each with a timestamp). But this can be changed as follows:

```shell
alter 'wiki', { NAME => 'text', VERSIONS => org.apache.hadoop.hbase.HConstants::ALL_VERSIONS }
```

We can also add a column-family (while the table is still disabled). The new column family called `revision`.

```shell
alter 'wiki', { NAME => 'revision', VERSIONS => org.apache.hadoop.hbase.HConstants::ALL_VERSIONS }
```

Similar to the `text` column family, the `revision` column family is added without any columns.

It is upon the user to honour the schema. However, if the user decides not to honour the schema, e.g., by adding data to `revision:new_column`, HBase will not stop them.

Lastly, we can set the compression method as follows:

```shell
alter 'wiki', {NAME=>'text', COMPRESSION=>'GZ', BLOOMFILTER=>'ROW'}
```

* Enable the table

```shell
enable 'wiki'
```
