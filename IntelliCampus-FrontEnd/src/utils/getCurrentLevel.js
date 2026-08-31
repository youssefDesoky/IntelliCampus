export function getCurrentLevel(user, t, arFn) {
  const level = user.level;
  const gpa = user.gpa ?? 0;

  const levelLabel = level != null
    ? arFn(t("profile.levelFormat", { level }))
    : "–";

  const gpaLabel = `${arFn(gpa.toFixed(2))} / 4.0`;

  return { level, gpa, levelLabel, gpaLabel };
}
