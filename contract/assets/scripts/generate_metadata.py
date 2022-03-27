import json
from pathlib import Path


METADATA_PATH = Path("../metadata")
IMAGES_PATH = Path("../images")

IMAGE_URL_IPFS = "ipfs://QmfUL123vUBV47YXTTdPW3ezkvshve9PG6DYYYvtRoYfvt"

NAME_TOKEN = "Rescue Toad #"
DESCRIPTION_TOKEN = "Thank you for hosting this toad in your wallet and donating to the Ukraine humanitarian effort! The toad will stay in your wallet as long as nobody else has matched or icreased your donation."

NAME_POAP = "Rescue Toad Glasses #"
DESCRIPTION_POAP = "Thank you for hosting a toad in your wallet and donating to the Ukraine humanitarian effort. It seems that somebody else matched or increased your donation, so the toad hopped into their wallet. However, it left you these pair of glasses as memento for your time together and your kind donation."


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
