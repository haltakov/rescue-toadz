import json
from pathlib import Path


METADATA_PATH = Path("../metadata")
IMAGES_PATH = Path("../images")

IMAGE_URL_IPFS = "ipfs://Qmf25keJPxAsefmghuRj2EcqBTstReBh43Amiymxucj8gp"

NAME_TOKEN = "Rescue Toad #"
DESCRIPTION_TOKEN = "Thank you for donating to Ukraine and putting up this toad in your wallet! It will stay here as long as nobody has matched your donation or donated more."

NAME_POAP = "Rescue Toad Glasses #"
DESCRIPTION_POAP = "You were once so kind to donate to Ukraine and put up a toad in your wallet. However, somebody matched your donation so the toad hopped in their wallet. The toad left you these glasses as memento for your time together and your kind donation."


def writeMetadataJSON(path, file_id, id, name, description):
    metadata = {
        "name": f"{name}{id}",
        "attributes": [],
        "description": description,
        "image": f"{IMAGE_URL_IPFS}/{file_id}.jpg",
    }

    with open(path / str(file_id), 'w') as outfile:
        json.dump(metadata, outfile, indent=4)


def main():
    images_files = list(IMAGES_PATH.glob("*.jpg"))
    images_files = sorted(
        images_files, key=lambda x: int(x.name.split(".")[0]))

    collectionSize = int(len(images_files)/2)
    # Generate the metadata for the toadz
    for i, image in enumerate(images_files[:collectionSize]):
        writeMetadataJSON(
            METADATA_PATH, i+1, i+1, NAME_TOKEN, DESCRIPTION_TOKEN)

    # Generate the metadata for the POAP
    for i, image in enumerate(images_files[collectionSize+1:]):
        writeMetadataJSON(
            METADATA_PATH, i+collectionSize+1, i+1, NAME_POAP, DESCRIPTION_POAP)


if __name__ == '__main__':
    main()
