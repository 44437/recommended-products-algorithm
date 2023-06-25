from sklearn.cluster import KMeans
import numpy as np
from PIL import Image
import os
import pickle
import json

path_of_images = 'images/'
cluster_count = 20
target_size = (287, 430)
images_nps = []
image_urls = []

for image_name in os.listdir(path_of_images):
    if ".jpg" not in image_name:
        continue

    image_urls.append(image_name)

    image = Image.open(os.path.join(path_of_images, image_name))
    resized_image = image.resize(target_size)
    gray_image = resized_image.convert('L')

    images_nps.append(np.array(gray_image))

images_np_array = np.array(images_nps)
reshaped_images = images_np_array.reshape(images_np_array.shape[0], -1)

kmeans = KMeans(n_clusters=cluster_count, random_state=0)
kmeans.fit(reshaped_images)

labels = kmeans.labels_

resultMap = {}

for i, label in enumerate(labels):
    cluster_number = str(label)
    if cluster_number not in resultMap:
        resultMap[cluster_number] = []

    resultMap[cluster_number].append(image_urls[i].replace('%2F', '/'))

with open('clustered_images.json', 'w') as file:
    json.dump(resultMap, file, indent=2)

# # these are for portable model
# model_file = "kmeans_model.pkl"
# with open(model_file, "wb") as f:
#     pickle.dump(kmeans, f)
#
# with open(model_file, "rb") as f:
#     kmeans_loaded = pickle.load(f)
