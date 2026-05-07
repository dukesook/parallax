# Original Data Found: https://figshare.com/articles/dataset/Ushant_AIS_dataset/8966273?file=16442771

for file in original/*.txt; do
  echo "Processing $file"
  output_file="csv/$(basename "${file%.txt}.csv")"

  # large/ is not tracked by git
  # output_file="large/$(basename "${file%.txt}.csv")"
  sed 's/;/,/g' "$file" > "$output_file"
done
  