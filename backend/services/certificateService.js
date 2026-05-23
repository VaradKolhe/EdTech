// Certificate generation is intentionally deferred. This hook is called when
// an enrollment completes so the real generation pipeline can be attached later.
export const queueCertificateGeneration = async () => null;
