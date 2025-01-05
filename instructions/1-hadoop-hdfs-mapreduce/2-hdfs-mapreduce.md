# **Instructions on HDFS and MapReduce in Java and Python**

## Store Data in Hadoop

### Create a folder in HDFS to store data

```shell
$HADOOP_HOME/bin/hdfs dfs -mkdir -p /usr/local/hadoop/input-test
```

### Create a file and put it into the input directory

```shell
echo "This is a sample file" > ~/file.txt

$HADOOP_HOME/bin/hdfs dfs -put ~/file.txt /usr/local/hadoop/input-test
```

### Verify that the file exists in the HDFS input directory

```shell
$HADOOP_HOME/bin/hdfs dfs -ls /usr/local/hadoop/input-test
```

You should also be able to see the file using the Web-UI: [http://localhost:9870/explorer.html#/](http://localhost:9870/explorer.html#/)

## Retrieve Data from Hadoop

### Preview the file in HDFS

```shell
$HADOOP_HOME/bin/hdfs dfs -cat /usr/local/hadoop/input-test/file.txt
```

### Download the file from HDFS

```shell
$HADOOP_HOME/bin/hdfs dfs -get /usr/local/hadoop/input-test/file.txt ~/retrieved-file-from-hdfs.txt

nano ~/retrieved-file-from-hdfs.txt
```

Other commands can be listed by executing:

```shell
$HADOOP_HOME/bin/hdfs dfs
```

## Sample MapReduce Program

This program computes the Pearson correlation coefficient between Age and Salary.
Formula for Pearson Correlation Coefficient:

```python
r=n⋅Σ(x⋅y)−Σ(x)⋅Σ(y) / sqrt([n⋅Σ(x2)−(Σ(x))2]⋅[n⋅Σ(y2)−(Σ(y))2])

Explanation of Key/Value Pairs in Mapper and Reducer:
    Mapper:
        Outputs the following key-value pairs for each record:
            ("x", Age)
            ("y", Salary)
            ("xy", Age * Salary)
            ("x2", Age^2)
            ("y2", Salary^2)
            ("count", 1)
    Reducer:
        Aggregates these values to calculate:
            n,Σ(x),Σ(x2),Σ(x⋅y),Σ(y),Σ(y2)
    Post-Processing:
        Once the job outputs the sums, you can calculate the Pearson correlation coefficient using the formula:
        
        r=n⋅Σ(x⋅y)−Σ(x)⋅Σ(y) / sqrt([n⋅Σ(x2)−(Σ(x))2]⋅[n⋅Σ(y2)−(Σ(y))2])
```

Create the folder to store the sample data and the MapReduce program:

```shell
cd ~
mkdir test
cd test

nano employee_data.csv
```

Then paste the following data into `employee_data.csv`:

```csv
id,age,salary
1,25,50000
2,30,60000
3,35,70000
4,40,80000
5,45,90000
6,50,100000
7,55,110000
8,60,120000
9,65,130000
10,70,140000
```

```shell
nano Correlation.java
```

Then paste the following Java code into `Correlation.java`:

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import java.io.IOException;

public class Correlation {

    // Mapper Class
    public static class CorrelationMapper extends Mapper<Object, Text, Text, DoubleWritable> {
        private final static Text X_KEY = new Text("x"); // For Sum(X)
        private final static Text Y_KEY = new Text("y"); // For Sum(Y)
        private final static Text XY_KEY = new Text("xy"); // For Sum(X * Y)
        private final static Text X2_KEY = new Text("x2"); // For Sum(X^2)
        private final static Text Y2_KEY = new Text("y2"); // For Sum(Y^2)
        private final static Text COUNT_KEY = new Text("count"); // For Count

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            String[] fields = value.toString().split(",");
            if (fields.length < 3 || fields[0].equals("id")) return; // Skip header

            try {
                double x = Double.parseDouble(fields[1]); // Age
                double y = Double.parseDouble(fields[2]); // Salary

                context.write(X_KEY, new DoubleWritable(x));
                context.write(Y_KEY, new DoubleWritable(y));
                context.write(XY_KEY, new DoubleWritable(x * y));
                context.write(X2_KEY, new DoubleWritable(x * x));
                context.write(Y2_KEY, new DoubleWritable(y * y));
                context.write(COUNT_KEY, new DoubleWritable(1.0));
            } catch (NumberFormatException e) {
                // Ignore invalid data
            }
        }
    }

    // Reducer Class
    public static class CorrelationReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {
        public void reduce(Text key, Iterable<DoubleWritable> values, Context context)
                throws IOException, InterruptedException {
            double sum = 0.0;
            for (DoubleWritable val : values) {
                sum += val.get();
            }
            context.write(key, new DoubleWritable(sum));
        }
    }

    // Main Method
    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "correlation calculation");
        job.setJarByClass(Correlation.class);
        job.setMapperClass(CorrelationMapper.class);
        job.setCombinerClass(CorrelationReducer.class);
        job.setReducerClass(CorrelationReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(DoubleWritable.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

## Compile the file and create a JAR file

```shell
# Compile the Java file
javac -classpath $HADOOP_HOME/share/hadoop/common/hadoop-common-3.3.6.jar:$HADOOP_HOME/share/hadoop/mapreduce/hadoop-mapreduce-client-core-3.3.6.jar -d . Correlation.java

# Create a JAR file for the compiled Java file
jar -cvf correlation.jar -C . .

# Put the employee_data.csv file into the input-test directory in HDFS
$HADOOP_HOME/bin/hdfs dfs -put ~/test/employee_data.csv /usr/local/hadoop/input-test

# Verify that the file exists in the HDFS input directory
$HADOOP_HOME/bin/hdfs dfs -ls /usr/local/hadoop/input-test
```

## Run the MapReduce job

```shell
$HADOOP_HOME/bin/hadoop jar correlation.jar Correlation /usr/local/hadoop/input-test/employee_data.csv /usr/local/hadoop/output-test
```

You should be able to see the status of the MapReduce job here as well: [http://localhost:8088/cluster/apps](http://localhost:8088/cluster/apps)

## View the output of the MapReduce job

```shell
$HADOOP_HOME/bin/hdfs dfs -cat /usr/local/hadoop/output-test/part-r-00000
```

The expected output is:

```txt
count   10.0
x       475.0
x2      24625.0
xy      4.925E7
y       950000.0
y2      9.85E10
```

This output can then be used to compute the correlation using the formula specified earlier, i.e.,

```python
r=n⋅Σ(x⋅y)−Σ(x)⋅Σ(y) / sqrt([n⋅Σ(x2)−(Σ(x))2]⋅[n⋅Σ(y2)−(Σ(y))2])

r = 10 ⋅ 49,250,000 − 475 ⋅ 950000 / sqrt([10 ⋅ 24,625 − 475^2] ⋅ [10 ⋅ 98,500,000,000 − 950000^2])
r = 41,250,000 / 41,250,000
r = 1; indicating a perfect positive correlation between Age and Salary.
```

## Streaming in Hadoop

Streaming in Hadoop refers to a mechanism that allows you to write MapReduce jobs in languages other than Java, such as Python, Ruby, Perl, or any other language that can read from standard input (stdin) and write to standard output (stdout). It is particularly useful for developers who are not comfortable with Java or want to leverage existing scripts for processing large datasets.

### Install Python

```shell
sudo apt-get update
sudo apt-get install -y python3 python3-pip

#Verify the Python installation
python3 --version
```

### Create the Sample Data

```shell
echo -e "kisumu nairobi mombasa\nmombasa kisumu kisumu\nkisumu nakuru" > /home/hadoop/test/input.txt
hadoop fs -put /home/hadoop/test/input.txt /usr/local/hadoop/input-test/

# Verify that the file exists in the HDFS input directory

$HADOOP_HOME/bin/hdfs dfs -ls /usr/local/hadoop/input-test

$HADOOP_HOME/bin/hdfs dfs -cat /usr/local/hadoop/input-test/input.txt
```

### Create the Mapper Python Script

```shell
nano /home/hadoop/test/mapper.py
```

A Python script that reads input lines and outputs words with a count of 1. Paste the following code into the file:

```python
#!/usr/bin/env python3
import sys

for line in sys.stdin:
    words = line.strip().split()
    for word in words:
        print(f"{word}\t1")
```

```shell
# Make the file executable
chmod +x /home/hadoop/test/mapper.py
```

### Create the Reducer Python Scripts

```shell
nano /home/hadoop/test/reducer.py
```

A Python script that sums the counts for each word. Paste the following code into the file:

```python
#!/usr/bin/env python3
import sys

current_word = None
current_count = 0

for line in sys.stdin:
    word, count = line.strip().split("\t")
    count = int(count)
    if word == current_word:
        current_count += count
    else:
        if current_word:
            print(f"{current_word}\t{current_count}")
        current_word = word
        current_count = count

if current_word:
    print(f"{current_word}\t{current_count}")
```

```shell
# Make the file executable
chmod +x /home/hadoop/test/reducer.py
```

### Run the Hadoop Streaming Job

```shell
$HADOOP_HOME/bin/hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -input /usr/local/hadoop/input-test/input.txt \
    -output /usr/local/hadoop/output-test-for-streaming \
    -mapper /home/hadoop/test/mapper.py \
    -reducer /home/hadoop/test/reducer.py
```

View the output results:

```shell
$HADOOP_HOME/bin/hadoop fs -cat /usr/local/hadoop/output-test-for-streaming/part-00000
```

The expected output is:

```txt
kisumu  4
mombasa 2
nairobi 1
nakuru  1
```

```shell
# In case you would like to delete the output directory:
$HADOOP_HOME/bin/hadoop fs -rm -r /usr/local/hadoop/output-test-for-streaming
hadoop fs -rm /usr/local/hadoop/input-test/input.txt
```
