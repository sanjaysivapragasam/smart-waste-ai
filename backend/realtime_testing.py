import pandas as pd

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