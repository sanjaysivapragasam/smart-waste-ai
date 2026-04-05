import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

df = pd.read_csv("realtime_metrics.csv")

metrics = [
    "capture_ms",
    "infer_ms",
    "draw_ms",
    "encode_ms",
    "emit_ms",
    "loop_ms",
    "display_fps"
]

# displaying the summarized results
summary = df[metrics].agg(["mean", "std", "min", "max"])
print(summary.round(2))

fps = df["display_fps"].values

# moving average (smooths noise)
window = 30
fps_smooth = np.convolve(fps, np.ones(window)/window, mode='valid')

plt.figure()

plt.plot(fps, label="Raw FPS", alpha=0.4)
plt.plot(range(window-1, len(fps)), fps_smooth, label="Smoothed FPS", linewidth=2)

plt.title("Real-Time Performance (FPS over Time)")
plt.xlabel("Frame Index")
plt.ylabel("FPS")
plt.legend()
plt.grid()

plt.show()