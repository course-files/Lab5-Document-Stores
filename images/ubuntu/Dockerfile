FROM ubuntu:20.04

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64/
ENV JRE_HOME=/usr/lib/jvm/temurin-21-jdk-amd64/

# Update package list
RUN apt-get update

# Install necessary packages
RUN apt-get install -y \
    wget \
    curl \
    ssh \
    rsync \
    openssh-server \
    nano \
    sudo \
    iputils-ping \
    ufw \
    iproute2 \
    vim

# Clean up APT when done
RUN apt-get clean

# Set root password
RUN echo 'root:root' | chpasswd

EXPOSE 8080 8443 22 9870 8088 16010
EXPOSE 8030 8031 8032 8033 8088
EXPOSE 2181 9000

CMD ["bash"]