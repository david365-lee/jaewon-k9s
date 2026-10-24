'use strict';

const localContextName = /^(docker-desktop|docker-for-desktop|minikube|rancher-desktop|orbstack|colima|microk8s|kind(?:-|$))/i;

function isLocalContext(name, server) {
  if (localContextName.test(name)) return true;
  try {
    const hostname = new URL(server).hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return hostname === 'localhost' ||
      hostname === '::1' ||
      hostname === 'kubernetes.docker.internal' ||
      hostname === 'host.docker.internal' ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname);
  } catch {
    return false;
  }
}

function parseContexts(data) {
  let config;
  try {
    config = JSON.parse(data);
  } catch {
    throw new Error('kubectl returned invalid JSON while reading contexts.');
  }
  if (!config || !Array.isArray(config.contexts) || !Array.isArray(config.clusters)) {
    throw new Error('The kubeconfig does not contain valid contexts and clusters.');
  }

  const clusters = new Map(config.clusters.map(entry => [entry.name, entry.cluster]));
  return config.contexts
    .filter(entry => entry && typeof entry.name === 'string' && entry.context)
    .map(entry => {
      const clusterName = entry.context.cluster || '';
      const server = clusters.get(clusterName)?.server || '';
      return {
        name: entry.name,
        cluster: clusterName,
        server,
        local: isLocalContext(entry.name, server),
        current: entry.name === config['current-context']
      };
    });
}

function createContextQuickPickItems(contexts, text) {
  return contexts.map(context => ({
    label: `${context.local ? '$(device-desktop)' : '$(cloud)'} ${context.name}`,
    description: [
      context.local ? text.local : text.remote,
      context.current ? text.current : context.cluster
    ].filter(Boolean).join(' · '),
    detail: context.server || text.noServer,
    context
  }));
}

module.exports = { createContextQuickPickItems, isLocalContext, parseContexts };
