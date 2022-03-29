import json
from pathlib import Path


METADATA_PATH = Path("../metadata")
IMAGES_PATH = Path("../images")

IMAGE_URL_IPFS = "ipfs://QmfUL123vUBV47YXTTdPW3ezkvshve9PG6DYYYvtRoYfvt"

NAME_TOKEN = "Rescue Toad #"
DESCRIPTION_TOKEN = "This is a Rescue Toad, raising funds for the Ukraine humanitarian effort.\n\nThe toad will stay in this wallet until someone else matches or increases the last donation."

NAME_POAP = "Rescue Toad Glasses #"
DESCRIPTION_POAP = "A pair of Rescue Toad glasses.\n\nThese were left as a memento by the Rescue Toad that was once hosted in this wallet. Thank you for contributing towards the Ukraine humanitarian effort."


def writeMetadataJSON(path, file_id, id, name, type, description):
    metadata = {
        "name": f"{name}{id}",
        "attributes": [dict(trait_type="Type", value=type)],
        "description": description,
        "image": f"{IMAGE_URL_IPFS}/{file_id}.jpg",
    }

    with open(path / str(file_id), "w") as outfile:
        json.dump(metadata, outfile, indent=4)


def main():
    images_files = list(IMAGES_PATH.glob("*.jpg"))
    images_files = sorted(
        images_files, key=lambda x: int(x.name.split(".")[0]))

    collectionSize = int(len(images_files) / 2)
    # Generate the metadata for the toadz
    for i, image in enumerate(images_files[:collectionSize]):
        writeMetadataJSON(
            METADATA_PATH, i + 1, i + 1, NAME_TOKEN, "Toad", DESCRIPTION_TOKEN
        )

    # Generate the metadata for the POAP
    for i, image in enumerate(images_files[collectionSize + 1:]):
        writeMetadataJSON(
            METADATA_PATH,
            i + collectionSize + 1,
            i + 1,
            NAME_POAP,
            "Glasses",
            DESCRIPTION_POAP,
        )


if __name__ == "__main__":
    main()
