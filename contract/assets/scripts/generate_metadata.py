import json
from pathlib import Path


METADATA_PATH = Path("../metadata")
IMAGES_PATH = Path("../images")

IMAGE_URL_IPFS = "ipfs://Qmbu82wQt8D3D2B2FMva33uwTvsWVzNvd9p2PPNPXpcg49"

NAME_TOKEN = "Ukraine Toad #"
DESCRIPTION_TOKEN = "All proceeds from buying this toad go to help the Ukraine. Anybody can buy the NFT if they offer more money than the price you bought it for"

NAME_POAP = "Ukraine Toad POAP #"
DESCRIPTION_POAP = "This POAP certifies that you once held an Ukrainian toad and you donated the money to Ukraine."


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
