"use client";

function cleanText(value) {
  return String(value || "").trim();
}

function fallbackInitials(value, fallback = "GU") {
  const text = cleanText(value);
  if (!text) return fallback;
  const words = text.split(/[\s/._-]+/).filter(Boolean);
  const seed = words.length > 1 ? `${words[0][0]}${words[1][0]}` : text.slice(0, 2);
  return seed.toUpperCase();
}

export function maskEmailAddress(value) {
  const [localPart, domain] = cleanText(value).toLowerCase().split("@");
  if (!localPart || !domain) return "";
  const visibleLocal = localPart.slice(0, Math.min(2, localPart.length));
  return `${visibleLocal}${localPart.length > 2 ? "***" : "*"}@${domain}`;
}

export function sessionMaskedIdentifier(session) {
  return session?.emailMasked || maskEmailAddress(session?.email);
}

export function sessionIdentityLabel(session, fallback = "Workspace user") {
  if (!session) return fallback;
  if (session.isGuest) return "Guest local workspace";

  const position = cleanText(session.position || session.member?.position);
  const department = cleanText(session.department || session.member?.department);
  const role = cleanText(session.role || session.member?.role);

  if (position && department) return `${position} / ${department}`;
  if (position) return position;
  if (role) return `${role} workspace user`;
  return sessionMaskedIdentifier(session) || cleanText(session.displayName) || fallback;
}

export function sessionRoleLabel(session, fallback = "Member") {
  const role = cleanText(session?.role || session?.member?.role) || fallback;
  const department = cleanText(session?.department || session?.member?.department);
  return department ? `${role} / ${department}` : role;
}

export function sessionInitials(session, fallback = "GU") {
  if (session?.isGuest) return "GU";
  return fallbackInitials(
    session?.position
      || session?.role
      || session?.department
      || sessionMaskedIdentifier(session)
      || session?.displayName,
    fallback,
  );
}

export function buildSessionProfile(session) {
  return {
    name: sessionIdentityLabel(session),
    role: sessionRoleLabel(session),
    initials: sessionInitials(session, "GE"),
    maskedIdentifier: sessionMaskedIdentifier(session),
  };
}

export function memberPrimaryLabel(member, fallback = "Workspace member") {
  const position = cleanText(member?.position);
  const role = cleanText(member?.role);
  const department = cleanText(member?.department);
  if (position && department) return `${position} / ${department}`;
  if (position) return position;
  if (role) return `${role} member`;
  return cleanText(member?.emailMasked) || cleanText(member?.id) || fallback;
}

export function memberSecondaryLabel(member) {
  const masked = cleanText(member?.emailMasked) || maskEmailAddress(member?.email);
  const status = cleanText(member?.status) || "active";
  return [masked, status].filter(Boolean).join(" / ");
}

export function memberActionLabel(member) {
  return cleanText(member?.emailMasked) || memberPrimaryLabel(member) || cleanText(member?.id) || "member";
}
