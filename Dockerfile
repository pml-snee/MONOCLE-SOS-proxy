# This Dockerfile creates an image basd on the current contents of the current folder



FROM centos:latest

LABEL maintainer="olcl@pml.ac.uk"


RUN yum -y update && \
    yum clean all && \
    rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7 && \
    yum install -y epel-release gcc && \
    yum install -y nodejs \
        npm \
        git \
        gcc-c++  && \
    mkdir -p /app/sos_proxy

COPY ./auth_token_gen_app/ ./docker-run.sh /app/sos_proxy/


WORKDIR /app/sos_proxy

RUN npm install -g n && \
    n 8.12.0 && \
    n use 8.12.0 && \
    npm install -g node-gyp && \
    yum install -y make && \
    npm install



RUN chmod +x /app/sos_proxy/docker-run.sh

EXPOSE 8888


CMD ["/app/sos_proxy/docker-run.sh"]