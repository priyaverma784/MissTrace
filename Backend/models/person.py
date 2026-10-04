class MissingPerson:
    def __init__(
        self,
        name,
        age,
        gender,
        photo_path,
        last_seen_location,
        last_seen_date,
        face_embedding=None
    ):
        self.name = name
        self.age = age
        self.gender = gender
        self.photo_path = photo_path
        self.last_seen_location = last_seen_location
        self.last_seen_date = last_seen_date
        self.face_embedding = face_embedding