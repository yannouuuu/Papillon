function extractNames (text) {
  const pattern = /\b([A-Z]+)\s+([A-Z][a-z]+)\b/g;
  const matches = [...text.matchAll(pattern)];
  return matches.map(match => `${match[1]} ${match[2]}`);
}

export const reduceIcalToCourse = (course, identityProvider) => {
  let returnCourse = {
    subject: course.summary?.value || "",
    id: course.uid?.value || "",
    type: "lesson",
    title: course.summary?.value || null,
    startTimestamp: course.dtstart && new Date(course.dtstart?.value).getTime() || null,
    endTimestamp: course.dtend && new Date(course.dtend?.value).getTime() || null,
    room: course.location?.value || null,
    teacher: course.organizer?.value || null,
    backgroundColor: null,
    status: null,
  };

  switch (identityProvider.identifier) {
    case "univ-rennes1":
      const teacher = extractNames(course.description?.value) || null;
      returnCourse = {
        ...returnCourse,
        teacher,
      };
  }

  return returnCourse;
};