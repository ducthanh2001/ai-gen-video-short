import re, sys
t = open("theogony-evelyn-white.txt", encoding="utf-8").read()
t = re.sub(r"\s+", " ", t)
parts = re.split(r"\[(\d+)\]", t)
chunks = [(int(parts[i]), parts[i+1].strip()) for i in range(1, len(parts)-1, 2)]
a, b = int(sys.argv[1]), int(sys.argv[2])
for n, s in chunks:
    if a <= n <= b:
        print(f"[{n}] {s}\n")
