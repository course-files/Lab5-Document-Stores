# Running MongoDB as a Cluster of Machines

**Source: [https://www.mongodb.com/resources/products/compatibilities/deploying-a-mongodb-cluster-with-docker](https://www.mongodb.com/resources/products/compatibilities/deploying-a-mongodb-cluster-with-docker)**

## 1. Create a Docker Network

```docker
docker network create mongoCluster
```

## 2. Start 3 Instances of MongoDB

```dockerfile
docker run -d --rm -p 27018:27017 --name mongo1 --network mongoCluster mongo:5 mongod --replSet myReplicaSet --bind_ip localhost,mongo1
```

```dockerfile
docker run -d --rm -p 27019:27017 --name mongo2 --network mongoCluster mongo:5 mongod --replSet myReplicaSet --bind_ip localhost,mongo2
 
docker run -d --rm -p 27020:27017 --name mongo3 --network mongoCluster mongo:5 mongod --replSet myReplicaSet --bind_ip localhost,mongo3
```

## 3. Initiate the Replica Set

```dockerfile
docker exec -it mongo1 mongosh --eval "rs.initiate({
 _id: \"myReplicaSet\",
 members: [
   {_id: 0, host: \"mongo1\"},
   {_id: 1, host: \"mongo2\"},
   {_id: 2, host: \"mongo3\"}
 ]
})"
```

## 4. Test and Verify the Replica Set

```dockerfile
docker exec -it mongo1 mongosh --eval "rs.status()"
```

You can stop one of the members of the cluster (mongo1) and try and read the data again.

```dockerfile
docker stop mongo1

docker exec -it mongo2 mongosh --eval "rs.status()"
```

The result shows that one of the other members has been elected as the primary node. If mongo1 rejoins the cluster, it will be a secondary member.

```dockerfile
docker run -d --rm -p 27018:27017 --name mongo1 --network mongoCluster mongo:5 mongod --replSet myReplicaSet --bind_ip localhost,mongo1

docker exec -it mongo1 mongosh --eval "rs.status()"
```
