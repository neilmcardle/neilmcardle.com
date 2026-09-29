export type InputCheck = {
  deviceId: string;
  label: string;

  peak: number;
  error?: string;
};

export async function listInputs(): Promise<MediaDeviceInfo[]> {
  const all = await navigator.mediaDevices.enumerateDevices();
  return all.filter((d) => d.kind === "audioinput");
}

export async function measureInput(
  deviceId: string | undefined,
  ms = 1500,
): Promise<{ peak: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
  const ctx = new AudioContext();
  try {
    await ctx.resume();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);

    let peak = 0;
    const until = performance.now() + ms;
    while (performance.now() < until) {
      analyser.getFloatTimeDomainData(buf);
      for (let i = 0; i < buf.length; i++) {
        const v = Math.abs(buf[i]);
        if (v > peak) peak = v;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return { peak };
  } finally {
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close().catch(() => {});
  }
}

export async function checkAllInputs(
  msEach = 1500,
  onProgress?: (label: string) => void,
): Promise<InputCheck[]> {
  const inputs = await listInputs();
  const results: InputCheck[] = [];
  for (const d of inputs) {
    const label = d.label || "Unnamed input";
    onProgress?.(label);
    try {
      const { peak } = await measureInput(d.deviceId, msEach);
      results.push({ deviceId: d.deviceId, label, peak });
    } catch (err) {
      results.push({
        deviceId: d.deviceId,
        label,
        peak: 0,
        error: (err as Error).name || "failed",
      });
    }
  }
  return results;
}
