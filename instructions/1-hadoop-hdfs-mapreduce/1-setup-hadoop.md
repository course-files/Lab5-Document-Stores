# Hadoop Setup in a Fully Distributed Mode

## 1. Build the Images

### Create and run the Zookeeper container

```shell
cd images/ubuntu/
```

```docker
docker build -t customized-ubuntu:1.0 .

docker run --name zookeeper \
    -it -p 2181:2181 \
    customized-ubuntu:1.0
```

```shell
# Add environment paths for zookeeper
sudo su
cat >> /etc/environment << EOL
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/
ZOOKEEPER_VERSION=3.9.3
ZOOKEEPER_HOME=/usr/local/zookeeper
PATH=$PATH:$ZOOKEEPER_HOME/bin
PATH=$PATH:$JAVA_HOME
EOL

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/
export ZOOKEEPER_VERSION=3.9.3
export ZOOKEEPER_HOME=/usr/local/zookeeper
export PATH=$PATH:$ZOOKEEPER_HOME/bin
export PATH=$PATH:$JAVA_HOME

source ~/.bashrc
```

```shell
# Verify the IP address for each of the 4 servers
ip addr show

# Verify the current hostname
cat /etc/hostname

# Edit the hosts file
nano /etc/hosts

# Append the following lines to the /etc/hosts file (use the verified IP addresses for each)
172.17.0.2 zookeeper
172.17.0.3 hadoop-master 
172.17.0.4 hadoop-slave-1 
172.17.0.5 hadoop-slave-2
```

```shell
# Add the hadoop user with a home directory and bash shell
sudo useradd -ms /bin/bash hadoop

# Set the password for the hadoop user
echo "hadoop:hadoop" | sudo chpasswd

# Add the hadoop user to the sudo group
sudo usermod -aG sudo hadoop

# Allow the hadoop user to execute any command without a password
echo "hadoop ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers
```

```shell
sudo su
# Make the directories in /usr/local/ that will store the Hadoop and HBase installations
mkdir $ZOOKEEPER_HOME
sudo chown -R hadoop:hadoop /usr/local/zookeeper
chmod -R u+rwx /usr/local/zookeeper
```

* Then install Java  and proceed to the next step below (_cf._ Step 8)

### Create and run 1 Hadoop Master and 2 Hadoop Slave Nodes

```docker
# Hadoop-Master
docker run --name hadoop-master \
    -it -p 9870:9870 -p 8088:8088 -p 16010:16010 \
    customized-ubuntu:1.0

# OR

docker start hadoop-master
docker attach hadoop-master
```

```docker
# Hadoop-Slave-1
docker run --name hadoop-slave-1 \
    -it \
    customized-ubuntu:1.0

# OR
docker start hadoop-slave-1
docker attach hadoop-slave-1
```

```docker
# Hadoop-Slave-2
docker run --name hadoop-slave-2 \
    -it \
    customized-ubuntu:1.0

OR
docker start hadoop-slave-1
docker attach hadoop-slave-1
```

## 2. Generate SSH Keys and Setup Passwordless SSH

NOTE: This is not necessary for the Zookeper node

```shell
# Verify the IP address for each of the 4 servers
ip addr show

# Verify the current hostname
cat /etc/hostname

# Edit the hosts file
nano /etc/hosts

# Append the following lines to the /etc/hosts file (use the verified IP addresses for each)
172.17.0.2 zookeeper
172.17.0.3 hadoop-master 
172.17.0.4 hadoop-slave-1 
172.17.0.5 hadoop-slave-2
```

### Set the required environment variables (on each server)

```shell
# Add the hadoop user with a home directory and bash shell
sudo useradd -ms /bin/bash hadoop

# Set the password for the hadoop user
echo "hadoop:hadoop" | sudo chpasswd

# Add the hadoop user to the sudo group
sudo usermod -aG sudo hadoop

# Allow the hadoop user to execute any command without a password
echo "hadoop ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers
```

```shell
sudo su
# Make the directories in /usr/local/ that will store the Hadoop and HBase installations
mkdir $HADOOP_HOME
mkdir $HBASE_HOME
sudo chown -R hadoop:hadoop /usr/local/hadoop
sudo chown -R hadoop:hadoop /usr/local/hbase
```

```shell
# Add environment paths for Hadoop
sudo su
cat >> /etc/environment << EOL
HADOOP_VERSION=3.3.6
HADOOP_HOME=/usr/local/hadoop
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/
PATH=$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$PATH

HADOOP_MAPRED_HOME=/usr/local/hadoop
HADOOP_COMMON_HOME=/usr/local/hadoop

HADOOP_HDFS_HOME=$HADOOP_HOME
YARN_HOME=/usr/local/hadoop
HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native 
PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin 
PATH=$PATH:/usr/local/hadoop/bin
HADOOP_INSTALL=$HADOOP_HOME

HBASE_VERSION=2.5.10
HBASE_HOME=/usr/local/hbase

CLASSPATH=$HADOOP_HOME/share/hadoop/common/*:$HADOOP_HOME/share/hadoop/common/lib/*:$HADOOP_HOME/share/hadoop/hdfs/*:$HADOOP_HOME/share/hadoop/hdfs/lib/*:$HADOOP_HOME/share/hadoop/mapreduce/*:$HADOOP_HOME/share/hadoop/mapreduce/lib/*:$HADOOP_HOME/share/hadoop/yarn/*:$HADOOP_HOME/share/hadoop/yarn/lib/*

HADOOP_CLASSPATH=$HADOOP_HOME/share/hadoop/common/*:$HADOOP_HOME/share/hadoop/common/lib/*:$HADOOP_HOME/share/hadoop/hdfs/*:$HADOOP_HOME/share/hadoop/hdfs/lib/*:$HADOOP_HOME/share/hadoop/yarn/*:$HADOOP_HOME/share/hadoop/yarn/lib/*:$HADOOP_HOME/share/hadoop/mapreduce/*:$HADOOP_HOME/share/hadoop/mapreduce/lib/*
EOL

su hadoop

export HADOOP_VERSION=3.3.6
export HADOOP_HOME=/usr/local/hadoop
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/
export PATH=$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$PATH

export HADOOP_MAPRED_HOME=/usr/local/hadoop
export HADOOP_COMMON_HOME=/usr/local/hadoop

export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME 
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native 
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin 
export HADOOP_INSTALL=$HADOOP_HOME 

export HBASE_VERSION=2.5.10
export HBASE_HOME=/usr/local/hbase

export CLASSPATH=$HADOOP_HOME/share/hadoop/common/*:$HADOOP_HOME/share/hadoop/common/lib/*:$HADOOP_HOME/share/hadoop/hdfs/*:$HADOOP_HOME/share/hadoop/hdfs/lib/*:$HADOOP_HOME/share/hadoop/mapreduce/*:$HADOOP_HOME/share/hadoop/mapreduce/lib/*:$HADOOP_HOME/share/hadoop/yarn/*:$HADOOP_HOME/share/hadoop/yarn/lib/*

export HADOOP_CLASSPATH=$HADOOP_HOME/share/hadoop/common/*:$HADOOP_HOME/share/hadoop/common/lib/*:$HADOOP_HOME/share/hadoop/hdfs/*:$HADOOP_HOME/share/hadoop/hdfs/lib/*:$HADOOP_HOME/share/hadoop/yarn/*:$HADOOP_HOME/share/hadoop/yarn/lib/*:$HADOOP_HOME/share/hadoop/mapreduce/*:$HADOOP_HOME/share/hadoop/mapreduce/lib/*

source ~/.bashrc
```

### Setup Passwordless SSH (on each Hadoop server - not necessary on Zookeeper)

```shell
sudo su
nano /etc/ssh/sshd_config

# Use Ctrl+W to search for "PermitRootLogin"

# Change from:
#PermitRootLogin prohibit-password

# Change to:
#PermitRootLogin Yes

# Restart the SSH Service
service ssh restart

# Confirm SSH is running
service ssh status
ps -ef | grep sshd
```

```shell
# Set the HADOOP_HOME variable
cat >> /etc/environment << EOL
HADOOP_HOME=/usr/local/hadoop
EOL

export HADOOP_HOME=/usr/local/hadoop

source ~/.bashrc
```

```shell
# Generate the SSH keys (as user hadoop) required for the connections
su hadoop
cd ~
pwd
ssh-keygen -t rsa

cat ~/.ssh/id_rsa.pub >> authorized_keys
```

```shell
ssh-copy-id -i ~/.ssh/id_rsa.pub hadoop@hadoop-master
ssh-copy-id -i ~/.ssh/id_rsa.pub hadoop@hadoop-slave-1
ssh-copy-id -i ~/.ssh/id_rsa.pub hadoop@hadoop-slave-2

chmod 0600 ~/.ssh/authorized_keys
```

## 3. Install and configure Zookeeper

```shell
# For Zookeeper to store its data
sudo mkdir -p $ZOOKEEPER_HOME/data
sudo chown -R hadoop:hadoop $ZOOKEEPER_HOME/data

wget https://downloads.apache.org/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz -P /tmp
ls -l /tmp
sudo su
tar -xzf /tmp/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz -C /usr/local
ls -l /usr/local/
mv /usr/local/apache-zookeeper-${ZOOKEEPER_VERSION}-bin ${ZOOKEEPER_HOME}
mv ${ZOOKEEPER_HOME}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin/* ${ZOOKEEPER_HOME}
rmdir ${ZOOKEEPER_HOME}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin

rm /tmp/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz
ls -l $ZOOKEEPER_HOME
```

```shell
sudo nano $ZOOKEEPER_HOME/conf/zoo.cfg
```

Paste the following:

```shell
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just
# example sakes.
dataDir=/usr/local/zookeeper/data
# the port at which the clients will connect
clientPort=2181
# Disable SASL (Simple Authentication and Security Layer) to support simple authentication
# (for local development)
sasl.enabled=false
```

```shell
# Locate the zkServer.sh file that is used to start/stop Zookeeper:
find / -name "zkServer.sh"

# Use the zkServer.sh file:
$ZOOKEEPER_HOME/bin/zkServer.sh stop
$ZOOKEEPER_HOME/bin/zkServer.sh start

$ZOOKEEPER_HOME/bin/zkServer.sh status

$ZOOKEEPER_HOME/bin/zkCli.sh -server localhost:2181
```

## 4. Download Hadoop and HBase

```shell
wget https://downloads.apache.org/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz -P /tmp
ls -l /tmp
sudo su
tar -xzf /tmp/hadoop-${HADOOP_VERSION}.tar.gz -C /usr/local
ls -l /usr/local/
mv /usr/local/hadoop-${HADOOP_VERSION} ${HADOOP_HOME}
mv ${HADOOP_HOME}/hadoop-${HADOOP_VERSION}/* ${HADOOP_HOME}
rmdir ${HADOOP_HOME}/hadoop-${HADOOP_VERSION}

rm /tmp/hadoop-${HADOOP_VERSION}.tar.gz
ls -l $HADOOP_HOME

wget https://downloads.apache.org/hbase/${HBASE_VERSION}/hbase-${HBASE_VERSION}-bin.tar.gz -P /tmp
ls -l /tmp
sudo su
tar -xzf /tmp/hbase-${HBASE_VERSION}-bin.tar.gz -C /usr/local
ls -l /usr/local/
mv /usr/local/hbase-${HBASE_VERSION} ${HBASE_HOME}
mv ${HBASE_HOME}/hbase-${HBASE_VERSION}/* ${HBASE_HOME}
rmdir ${HBASE_HOME}/hbase-${HBASE_VERSION}

rm /tmp/hbase-${HBASE_VERSION}-bin.tar.gz
ls -l $HBASE_HOME
```

## 5. Customize the Hadoop Config Files (in the `hadoop-master` node)

```shell
su hadoop
nano $HADOOP_HOME/etc/hadoop/core-site.xml
```

Paste the following:

```xml
   <property>
      <name>fs.defaultFS</name>
      <value>hdfs://hadoop-master:9000</value>
   </property>
      <property>
      <name>dfs.permissions</name>
      <value>false</value>
   </property>
    <property>
        <name>ipc.client.connect.timeout</name>
        <value>30000</value> <!-- 30 seconds -->
    </property>

```

```shell
nano $HADOOP_HOME/etc/hadoop/hdfs-site.xml
```

```xml
   <property>
      <name>dfs.replication</name>
      <value>1</value>
   </property>
   <property>
      <name>dfs.name.dir</name>
      <value>file:///home/hadoop/hadoopinfra/hdfs/namenode </value>
   </property>
   <property>
      <name>dfs.data.dir</name>
      <value>file:///home/hadoop/hadoopinfra/hdfs/datanode </value>
   </property>
```

```shell
nano $HADOOP_HOME/etc/hadoop/yarn-site.xml
```

```xml
   <property>
      <name>yarn.resourcemanager.hostname</name>
      <value>hadoop-master</value>
   </property>
   <property>
      <name>yarn.resourcemanager.address</name>
      <value>hadoop-master:8032</value>
   </property>
   <property>
      <name>yarn.nodemanager.aux-services</name>
      <value>mapreduce_shuffle</value>
   </property>
```

```shell
nano $HADOOP_HOME/etc/hadoop/mapred-site.xml
```

```xml
   <property>
      <name>mapreduce.framework.name</name>
      <value>yarn</value>
   </property>
   <property>
      <name>yarn.app.mapreduce.am.env</name>
      <value>HADOOP_MAPRED_HOME=$HADOOP_HOME</value>
   </property>
   <property>
      <name>mapreduce.map.env</name>
      <value>HADOOP_MAPRED_HOME=$HADOOP_HOME</value>
   </property>
   <property>
      <name>mapreduce.reduce.env</name>
      <value>HADOOP_MAPRED_HOME=$HADOOP_HOME</value>
   </property>
   <property>
      <name>mapred.job.tracker</name>
      <value>hadoop-master:9001</value>
   </property>
```

```shell
sudo nano $HBASE_HOME/conf/hbase-site.xml
```

Remove the existing content and paste the following:

```xml
   <property>
      <name>hbase.rootdir</name>
      <value>hdfs://hadoop-master:9000/hbase</value>
   </property>
   <property>
      <name>hbase.cluster.distributed</name>
      <value>true</value>
   </property>
   <property>
      <name>hbase.zookeeper.quorum</name>
      <value>zookeeper:2181</value>
   </property>
   <property>
      <name>hbase.zookeeper.property.dataDir</name>
      <value>/usr/local/zookeeper/data</value>
   </property>
   <property>
      <name>hbase.regionserver.port</name>
      <value>16201</value>
   </property>
   <property>
      <name>hbase.rootdir</name>
      <value>hdfs://hadoop-master:9000/hbase</value>
   </property>
   <property>
      <name>hbase.zookeeper.property.dataDir</name>
      <value>/usr/local/zookeeper/data</value>
   </property>
   <property>
      <name>hbase.cluster.distributed</name>
      <value>true</value>
   </property>
   <property>
      <name>hbase.zookeeper.quorum</name>
      <value>zookeeper:2181</value>
   </property>
   <property>
      <name>zookeeper.session.timeout</name>
      <value>60000</value>
   </property>
   <property>
      <name>hbase.zookeeper.property.clientPort</name>
      <value>2181</value>
   </property>
```

```shell
# 5. Configure hbase-env.sh
sudo nano $HBASE_HOME/conf/hbase-env.sh
# Edit the following line from:
# export JAVA_HOME=/usr/java/jdk1.8.0/
# To:
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
```

## 6. Copy the configuration files from the master node to all the other nodes

```shell
sudo mkdir $HADOOP_HOME
sudo mkdir $HBASE_HOME

sudo chown -R hadoop:hadoop $HADOOP_HOME
sudo chown -R hadoop:hadoop $HBASE_HOME
```

```shell
scp -r $HADOOP_HOME hadoop@hadoop-slave-1:$HADOOP_HOME
scp -r $HBASE_HOME hadoop@hadoop-slave-1:$HBASE_HOME

scp -r $HADOOP_HOME hadoop@hadoop-slave-2:$HADOOP_HOME
scp -r $HBASE_HOME hadoop@hadoop-slave-2:$HBASE_HOME
```

Execute on each Hadoop slave node:

```shell
mv ${HADOOP_HOME}/hadoop/* ${HADOOP_HOME}
rmdir ${HADOOP_HOME}/hadoop

mv ${HBASE_HOME}/hbase/* ${HBASE_HOME}
rmdir ${HBASE_HOME}/hbase

sudo chown -R hadoop:hadoop $HADOOP_HOME
sudo chown -R hadoop:hadoop $HBASE_HOME
```

```shell
# For each node:
echo "export HADOOP_OPTS=-Djava.net.preferIPv4Stack=true" >> ${HADOOP_HOME}/etc/hadoop/hadoop-env.sh
echo "export HADOOP_CONF_DIR=/usr/local/hadoop/etc/hadoop" >> ${HADOOP_HOME}/etc/hadoop/hadoop-env.sh
echo "export HADOOP_OPTS=-Djava.library.path=$HADOOP_HOME/lib/native" >> ${HADOOP_HOME}/etc/hadoop/hadoop-env.sh

export HADOOP_OPTS="$HADOOP_OPTS --add-opens=java.base/java.lang=ALL-UNNAMED"
export HADOOP_OPTS="$HADOOP_OPTS --add-opens=java.base/java.lang.reflect=ALL-UNNAMED"
export HADOOP_OPTS="$HADOOP_OPTS -Djava.library.path=$HADOOP_HOME/lib/native"
```

## 7. Configure the Hadoop and HBase Master Files and Slave Files

Execute from hadoop-master:

```shell
sudo nano /usr/local/hadoop/etc/hadoop/masters
# Enter the following lines in the masters file:
hadoop-master
```

Execute from hadoop-slave-*:

```shell
sudo nano /usr/local/hadoop/etc/hadoop/slaves

# Enter the following lines in the slaves file:
hadoop-slave-1
hadoop-slave-2
```

## 8. Install Java

```shell
sudo su
sudo apt install -y gnupg

# Add the Eclipse Adoptium GPG key
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo apt-key add -

# Add the Eclipse Adoptium apt repository
echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

# Install the required JDK version
sudo apt update
# sudo apt install temurin-8-jdk
# sudo apt install temurin-21-jdk
sudo apt install -y openjdk-8-jdk

# Set the default JDK version (if there are multiple versions installed)
sudo update-alternatives --config java

# Set the JAVA_HOME and JRE_HOME variables

# Old settings for Temurin were:
# JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64/
# JRE_HOME=/usr/lib/jvm/temurin-21-jdk-amd64/
sudo su

cat >> /etc/environment << EOL
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/
EOL

su hadoop

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export JRE_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre/

source ~/.bashrc

# Verify the Java version (openjdk version "21.0.5" 2024-10-15 LTS at the time of installation)
java -version
```

## 9. Format the namenode on the master node

```shell
sudo su
# Set the JAVA_HOME and JRE_HOME variables
cat >> /etc/environment << EOL
HDFS_DATANODE_USER=hadoop
HDFS_NAMENODE_USER=hadoop
HDFS_SECONDARYNAMENODE_USER=hadoop
EOL

su hadoop
export HDFS_DATANODE_USER=hadoop
export HDFS_NAMENODE_USER=hadoop
export HDFS_SECONDARYNAMENODE_USER=hadoop
source ~/.bashrc

sudo chown -R hadoop:hadoop $HADOOP_HOME
sudo chown -R hadoop:hadoop $HBASE_HOME
```

```shell
$HADOOP_HOME/bin/hdfs namenode -format
```

## 10. Start HDFS and YARN services on the master node

```shell
$HADOOP_HOME/sbin/start-dfs.sh
$HADOOP_HOME/sbin/start-yarn.sh
```

## 11. Verify that Hadoop is running

```shell
$HADOOP_HOME/bin/hadoop version
$HADOOP_HOME/bin/hdfs dfsadmin -report
$HADOOP_HOME/bin/yarn node -list
$JAVA_HOME/bin/jps
```

Verify via the Web-UI:

[http://localhost:9870/](http://localhost:9870/)

[http://localhost:8088/](http://localhost:8088/)

## 12. Start HBase services

### On the master node

```shell
$HBASE_HOME/bin/start-hbase.sh
```

### On each slave node

```shell
sudo $HBASE_HOME/bin/hbase-daemon.sh start regionserver
```

### On the master node (confirmation of running services)

```shell
$JAVA_HOME/bin/jps
```

## 13. Access HBase Web-UI and Shell

Access the HBase Master Web-UI

[http://localhost:16010](http://localhost:16010)

Access the HBase Master Shell

```shell
$HBASE_HOME/bin/hbase shell
```
