# Repli sans parallélisme hébergé : un agent auto-hébergé dans Docker

Les nouvelles organisations Azure DevOps n'ont pas de minutes hébergées gratuites tant que le grant n'est pas accordé. Un agent auto-hébergé, lancé dans Docker sur le poste, exécute les pipelines immédiatement (le parallélisme auto-hébergé offre 1 job gratuit).

1. Azure DevOps > Organization settings > Agent pools > Add pool : `docker-local` (Self-hosted).
2. User settings > Personal access tokens : PAT avec portée **Agent Pools (Read & manage)**, expiration courte.
3. Lancer l'agent (image officielle) :

```powershell
docker run -d --name azp-agent --restart unless-stopped `
  -e AZP_URL=https://dev.azure.com/<org> `
  -e AZP_TOKEN=<PAT> `
  -e AZP_POOL=docker-local `
  -e AZP_AGENT_NAME=poste-formation `
  -v /var/run/docker.sock:/var/run/docker.sock `
  mcr.microsoft.com/azure-pipelines/vsts-agent:ubuntu-22.04
```

Le montage du socket Docker permet au job d'utiliser `docker compose` (le pipeline construit et lance les conteneurs sur la machine hôte). Sur Windows avec Docker Desktop : `-v //var/run/docker.sock:/var/run/docker.sock`.

4. Dans `azure-pipelines.yml` : `pool: { name: docker-local }` à la place de `vmImage`.
5. Vérifier : Agent pools > docker-local > l'agent est « Online » ; lancer le pipeline.

Sécurité (M7.4, M9.2) : le PAT n'est jamais committé ; l'agent tourne sur un poste de formation, pas de production ; supprimer le conteneur et révoquer le PAT en fin de formation.
