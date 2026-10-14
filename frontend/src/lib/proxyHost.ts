type ProxyRequest = {
  setHeader: (name: string, value: string) => void;
};

type IncomingRequest = {
  headers: {
    host?: string;
  };
};

export function preserveClientHost(proxyRequest: ProxyRequest, request: IncomingRequest): void {
  const host = request.headers.host;
  if (host) proxyRequest.setHeader("host", host);
}
