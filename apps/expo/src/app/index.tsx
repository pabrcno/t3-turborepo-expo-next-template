import React, { useEffect, useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { verifyInstallation } from "nativewind";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { useSignIn, useSignOut, useUser } from "~/utils/auth";

function PostCard(props: {
  post: RouterOutputs["post"]["all"][number];
  onDelete: () => void;
}) {
  console.log("post", props.post);
  return (
    <View className="bg-green flex flex-row rounded-lg p-4">
      <View className="flex-grow">
        <Link
          asChild
          href={{
            pathname: "/post/[id]",
            params: { id: props.post.id },
          }}
        >
          <Pressable className="bg-red">
            <Text className="text-xl font-semibold text-primary">
              {props.post.title}
            </Text>
            <Text className="mt-2">{props.post.content}</Text>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={props.onDelete}>
        <Text className="font-bold uppercase text-primary">Delete</Text>
      </Pressable>
    </View>
  );
}

function CreatePost() {
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { mutate, error } = api.post.create.useMutation({
    async onSuccess() {
      setTitle("");
      setContent("");
      await utils.post.all.invalidate();
    },
  });

  return (
    <View className="mt-4 flex gap-2">
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <Text className="mb-2 text-destructive">
          {error.data.zodError.fieldErrors.title}
        </Text>
      )}
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
        value={content}
        onChangeText={setContent}
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.content && (
        <Text className="mb-2 text-destructive">
          {error.data.zodError.fieldErrors.content}
        </Text>
      )}
      <Pressable
        className="flex items-center rounded bg-primary p-2"
        onPress={() => {
          mutate({
            title,
            content,
          });
        }}
      >
        <Text className="text-foreground">Create</Text>
      </Pressable>
      {error?.data?.code === "UNAUTHORIZED" && (
        <Text className="mt-2 text-destructive">
          You need to be logged in to create a post
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <>
      <Text className="pb-2 text-center text-xl font-semibold text-white">
        {user?.name ?? "Not logged in"}
      </Text>
      <Button
        onPress={() => (user ? signOut() : signIn())}
        title={user ? "Sign Out" : "Sign In With Discord"}
        color={"#FF0000"}
      />
    </>
  );
}

export default function Index() {
  verifyInstallation();
  const utils = api.useUtils();

  const postQuery = api.post.all.useQuery();

  const deletePostMutation = api.post.delete.useMutation({
    onSettled: () => utils.post.all.invalidate(),
  });

  useEffect(() => {
    console.log("postQuery.data", postQuery.data);
  }, [postQuery.data]);

  return (
    <SafeAreaView className="bg-white">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "HEY Page" }} />
      <View className="h-full w-full bg-white p-4">
        <Text className="pb-2 text-center text-5xl font-bold text-foreground">
          Create <Text className="text-primary">T3</Text> Turbo
        </Text>

        <View className="py-2">
          <Text className="font-semibold italic text-primary">
            Press on a post
          </Text>
        </View>
        <MobileAuth />
        <View className="h-96 w-full">
          <FlashList
            data={postQuery.data}
            estimatedItemSize={100}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={(p) => (
              <PostCard
                post={p.item}
                onDelete={() => deletePostMutation.mutate(p.item.id)}
              />
            )}
          />
        </View>

        <CreatePost />
      </View>
    </SafeAreaView>
  );
}
