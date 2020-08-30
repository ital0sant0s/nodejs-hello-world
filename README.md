# nodejs-hello-world

Esse projeto é uma demonstração de uma aplicação que utiliza NodeJS, MySQL, Docker e Kubernetes

O diretório mysql-example contém todo o código necessário

## Rodando localmente com Docker
Para rodar o projeto de forma local é necessário verificar os seguintes requisitos:
- Docker instalado
- Docker-Compose instalado (Opcional)
- Buildar a imagem do app 

Para testar localmente basta executar o seguinte

```sh
$ docker build -t italosantos/nodejs-mysql .
$ docker run --name some-mysql -e MYSQL_DATABASE=helloworld -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -d mysql:5.7
$ docker run -d --name some-app -e DB_HOST=some-mysql -e DB_USER=root -e DB_PASSWORD=my-secret-pw -e DB_NAME=helloworld -p 3000:3000 italosantos/nodejs-mysql
```

Ou com docker-compose, verifique os valores das envs no arquivo docker-compose.yml e execute
```sh
$ docker-compose build
$ docker-compose up -d
```
####### Lembrando que a tabela e o valor devem ser incluídos, no diretório database/scripts existe um exemplo


#### Testando
O app espera a requisição no path /helloworld, então basta fazer uma chamada via browser para http://localhost:3000/helloworld

## Usando Kubernetes

No kubernetes adotamos o helm como empacotador, para fazer o deploy verifique os requisitos:
- Kubernetes instalado (Neste exemplo consideramos o minikube)
- Helm instalado
- Habilitar o ingress 

Para deployar no kubernetes:
- Decidi separar o db do app em 2 namespaces
#### Criando namespaces
```sh
$ kubectl create namespace mysql
$ kubectl create namespace helloworld
```

#### Fazendo deploy do DB
```sh
$ kubectl config set-context --current --namespace=mysql
$ helm install hello-world stable/mysql \
  --set mysqlRootPassword=my-secret-pw,mysqlUser=helloworld,mysqlPassword=my-secret-pw,mysqlDatabase=helloworld -f values.yaml
```
No caso do Kubernetes a criação da tabela e os valores estão automatizados


#### Fazendo deploy do APP
```sh
$ kubectl config set-context --current --namespace=helloworld
$ helm install hello-world-app ./helloworld  -f helloworld/values.yaml
```

#### Testando
Para testar eu apresento 2 formas  
- kubectl port-forward
- acrescentar o dominio no /etc/hosts

#### kubectl port-forward
```sh
$ kubectl port-forward  service/hello-world-app-helloworld 3000:80
```
Agora basta fazer uma chamada para http://localhost:3000/helloworld

#### acrescentar o dominio no /etc/hosts
```sh
$ echo "$(minikube ip) some-host.local" | sudo tee -a /etc/hosts
```


## Drone CI
Para pipeline escolho o Drone CI, uma ferramenta que usa Kubernetes nativamente.

#### Deploy do Drone CI
Dependencias:
- Criar um Client_ID e Client_Secret para qualquer um dos serviços Git suportados (GitHub, Gitlab, Bitbucket, etc)
- Criar namespace drone

No diretório mysql-example/helm/drone_ci temos um exemplo de values.yaml para fazer o deploy é necessário seguir os seguintes passos:
```sh
$ helm repo add drone https://charts.drone.io
$ helm repo update
```

No diretório existem 2 values, devemos iniciar com o values.yaml que corresponde ao drone server e depois o drone-runner-kube-values.yaml
Lembrando que alguns valores devem ser alterados no arquivo:
- DRONE_SERVER_HOST
- DRONE_GITHUB_CLIENT_ID
- DRONE_GITHUB_CLIENT_SECRET
```sh
kubectl create namespace drone
helm install drone drone/drone --namespace drone -f drone-values.yaml
helm install drone-runner-kube drone/drone-runner-kube --namespace drone --values drone-runner-kube-values.yaml
```

#### Pipeline Drone CI
A pipeline do drone ci deve estar na raiz do repo, com nome .drone.yaml, em nosso exemplo criei uma pipeline simples, que apenas faz o build e push da imagem para um repo Docker hub e faz o deploy do app via helm no kubernetes

Para que a pipeline funcione alguns valores tem de ser cadastrados como secrets no drone
- prod_docker_username
- prod_docker_password
- prod_api_server
- prod_kubernetes_token

Com esses secrets cadastrados, sempre que houver um push na master a pipeline será executada

