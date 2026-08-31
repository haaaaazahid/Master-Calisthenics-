UPDATE programs
SET
    title = 'Kickboxing',
    subtitle = CONVERT(X'5374726F6E6720E280A220436F6E666964656E7420E280A2204865616C746879' USING utf8mb4),
    icon = CONVERT(X'F09FA58A' USING utf8mb4),
    features = '[""Mon-Wed-Fri (Evening: 6:15 & 7:30)"",""Fat loss & toning focus"",""Safe & comfortable environment"",""Strength & mobility building"",""Mix of Skills, HIIT, & Strength""]',
    pricing = CONCAT(
      '[[""3 Days/Week (12 Sessions)"",""',
      CONVERT(X'E282B9322C353030' USING utf8mb4),
      '"\"],[""3 Months"",""',
      CONVERT(X'E282B9372C353030' USING utf8mb4),
      '"\"],[""6 Months"",""',
      CONVERT(X'E282B931322C303030' USING utf8mb4),
      '"\"],[""1 Year"",""',
      CONVERT(X'E282B931382C303030' USING utf8mb4),
      '"\" ]]'
    )
WHERE id = 5;
