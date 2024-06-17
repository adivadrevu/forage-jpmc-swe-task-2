from random import normalvariate, random
from datetime import timedelta, datetime
import csv
import os.path

# Configuration parameters
REALTIME = True
SIM_LENGTH = timedelta(days=365 * 5)
MARKET_OPEN = datetime.today().replace(hour=0, minute=30, second=0)

SPD = (2.0, 6.0, 0.1)
PX = (60.0, 150.0, 1)
FREQ = (12, 36, 50)
OVERLAP = 4

# Function to generate a bounded random walk
def bwalk(min, max, std):
    rng = max - min
    while True:
        max += normalvariate(0, std)
        yield abs((max % (rng * 2)) - rng) + min

# Function to generate a random series of market conditions
def market(t0=MARKET_OPEN):
    for hours, px, spd in zip(bwalk(*FREQ), bwalk(*PX), bwalk(*SPD)):
        yield t0, px, spd
        t0 += timedelta(hours=abs(hours))

# Function to generate random limit orders from market conditions
def orders(hist):
    for t, px, spd in hist:
        stock = 'ABC' if random() > 0.5 else 'DEF'
        side, d = ('sell', 2) if random() > 0.5 else ('buy', -2)
        order = round(normalvariate(px + (spd / d), spd / OVERLAP), 2)
        size = int(abs(normalvariate(0, 100)))
        yield t, stock, side, order, size

# Function to generate a CSV file with order history
def generate_csv():
    with open('test.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        for idx, (t, stock, side, order, size) in enumerate(orders(market())):
            if t > MARKET_OPEN + SIM_LENGTH:
                break
            writer.writerow([t, stock, side, order, size])
            if idx < 10:  # Print first 10 rows for debug
                print(f"Row {idx}: {[t, stock, side, order, size]}")
    print("CSV generation completed.")

# Main script execution
if __name__ == '__main__':
    if not os.path.isfile('test.csv'):
        print("No data found, generating...")
        generate_csv()
    else:
        print("Data already present, skipping generation.")
